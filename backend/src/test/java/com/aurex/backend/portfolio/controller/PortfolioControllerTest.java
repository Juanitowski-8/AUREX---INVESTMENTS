package com.aurex.backend.portfolio.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
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
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void portfolioCrudFlow() throws Exception {
        String token = registerAndGetToken("portfolio.user+" + System.currentTimeMillis() + "@example.com");

        MvcResult createResult =
                mockMvc.perform(
                                post("/api/portfolios")
                                        .header("Authorization", "Bearer " + token)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of(
                                                                "name",
                                                                "Core Growth Portfolio",
                                                                "baseCurrency",
                                                                "USD",
                                                                "description",
                                                                "Main simulated investment portfolio"))))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.success").value(true))
                        .andExpect(jsonPath("$.data.name").value("Core Growth Portfolio"))
                        .andExpect(jsonPath("$.data.baseCurrency").value("USD"))
                        .andReturn();

        String portfolioId =
                objectMapper
                        .readTree(createResult.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

        mockMvc.perform(get("/api/portfolios").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(portfolioId));

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.description")
                        .value("Main simulated investment portfolio"));

        mockMvc.perform(
                        put("/api/portfolios/" + portfolioId)
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "name",
                                                        "Updated Portfolio",
                                                        "baseCurrency",
                                                        "EUR",
                                                        "description",
                                                        "Updated description"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Updated Portfolio"))
                .andExpect(jsonPath("$.data.baseCurrency").value("EUR"));

        mockMvc.perform(
                        delete("/api/portfolios/" + portfolioId)
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/portfolios").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void listWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/portfolios")).andExpect(status().isUnauthorized());
    }

    @Test
    void accessOtherUsersPortfolioReturnsNotFound() throws Exception {
        String tokenA = registerAndGetToken("user.a+" + System.currentTimeMillis() + "@example.com");
        String tokenB = registerAndGetToken("user.b+" + System.currentTimeMillis() + "@example.com");

        MvcResult createResult =
                mockMvc.perform(
                                post("/api/portfolios")
                                        .header("Authorization", "Bearer " + tokenA)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of("name", "Private Portfolio"))))
                        .andExpect(status().isCreated())
                        .andReturn();

        String portfolioId =
                objectMapper
                        .readTree(createResult.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId)
                                .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void createWithMissingNameReturnsBadRequest() throws Exception {
        String token = registerAndGetToken("invalid+" + System.currentTimeMillis() + "@example.com");

        mockMvc.perform(
                        post("/api/portfolios")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of("baseCurrency", "USD"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void getNonExistentPortfolioReturnsNotFound() throws Exception {
        String token = registerAndGetToken("missing+" + System.currentTimeMillis() + "@example.com");

        mockMvc.perform(
                        get("/api/portfolios/" + UUID.randomUUID())
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    private String registerAndGetToken(String email) throws Exception {
        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "fullName",
                                                        "Test User",
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
