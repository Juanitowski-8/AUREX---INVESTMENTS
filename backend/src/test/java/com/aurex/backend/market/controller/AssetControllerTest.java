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
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        String email = "assets+" + System.currentTimeMillis() + "@example.com";
        token = registerAndGetToken(email);
    }

    @Test
    void listAssetsOrderedBySymbol() throws Exception {
        mockMvc.perform(get("/api/assets").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(9))
                .andExpect(jsonPath("$.data[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$.data[8].symbol").value("TSLA"));
    }

    @Test
    void searchBySymbolCaseInsensitive() throws Exception {
        mockMvc.perform(
                        get("/api/assets/search")
                                .param("query", "btc")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].symbol").value("BTC"))
                .andExpect(jsonPath("$.data[0].name").value("Bitcoin"))
                .andExpect(jsonPath("$.data[0].assetType").value("CRYPTO"))
                .andExpect(jsonPath("$.data[0].externalId").value("bitcoin"));
    }

    @Test
    void searchByName() throws Exception {
        mockMvc.perform(
                        get("/api/assets/search")
                                .param("query", "nvidia")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].symbol").value("NVDA"));
    }

    @Test
    void getBySymbolCaseInsensitive() throws Exception {
        mockMvc.perform(
                        get("/api/assets/eth").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.symbol").value("ETH"))
                .andExpect(jsonPath("$.data.externalId").value("ethereum"));
    }

    @Test
    void getUnknownSymbolReturnsNotFound() throws Exception {
        mockMvc.perform(
                        get("/api/assets/UNKNOWN").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void listWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/assets")).andExpect(status().isUnauthorized());
    }

    @Test
    void searchWithoutQueryReturnsBadRequest() throws Exception {
        mockMvc.perform(
                        get("/api/assets/search").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    private String registerAndGetToken(String email) throws Exception {
        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "fullName",
                                                        "Asset Tester",
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
