package com.aurex.backend.market.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        token = registerAndGetToken("market+" + System.currentTimeMillis() + "@example.com");
    }

    @Test
    void tickerReturnsRequestedSymbols() throws Exception {
        mockMvc.perform(
                        get("/api/market/ticker")
                                .param("symbols", "BTC,ETH,INVALID")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].symbol").value("BTC"))
                .andExpect(jsonPath("$.data[0].source").value("MOCK"))
                .andExpect(jsonPath("$.data[0].price").exists())
                .andExpect(jsonPath("$.data[0].change24h").exists());
    }

    @Test
    void tickerWithAllInvalidSymbolsReturnsBadRequest() throws Exception {
        mockMvc.perform(
                        get("/api/market/ticker")
                                .param("symbols", "FOO,BAR")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_SYMBOLS"));
    }

    @Test
    void listMarketAssets() throws Exception {
        mockMvc.perform(
                        get("/api/market/assets").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(9))
                .andExpect(jsonPath("$.data[0].price").exists());
    }

    @Test
    void historyForSymbol() throws Exception {
        mockMvc.perform(
                        get("/api/market/history/BTC")
                                .param("days", "7")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(7))
                .andExpect(jsonPath("$.data[0].date").exists())
                .andExpect(jsonPath("$.data[0].price").exists());
    }

    @Test
    void marketEndpointsRequireAuth() throws Exception {
        mockMvc.perform(get("/api/market/ticker").param("symbols", "BTC"))
                .andExpect(status().isUnauthorized());
    }

    private String registerAndGetToken(String email) throws Exception {
        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "fullName",
                                                        "Market User",
                                                        "email",
                                                        email,
                                                        "password",
                                                        "password123"))))
                .andExpect(status().isCreated());

        MvcResult loginResult =
                mockMvc.perform(
                                post("/api/auth/login")
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of("email", email, "password", "password123"))))
                        .andExpect(status().isOk())
                        .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }
}
