package com.aurex.backend.ai.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
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
class AIControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @Test
    void generateAndListAnalysis() throws Exception {
        String token = registerAndGetToken("ai+" + System.currentTimeMillis() + "@example.com");
        String portfolioId = createPortfolio(token);

        mockMvc.perform(
                        post("/api/transactions")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "portfolioId",
                                                        portfolioId,
                                                        "assetSymbol",
                                                        "BTC",
                                                        "type",
                                                        "BUY",
                                                        "quantity",
                                                        0.1,
                                                        "price",
                                                        60000,
                                                        "transactionDate",
                                                        "2026-05-18T10:00:00Z"))))
                .andExpect(status().isCreated());

        MvcResult generateResult =
                mockMvc.perform(
                                post("/api/ai/portfolio-summary/" + portfolioId)
                                        .header("Authorization", "Bearer " + token))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.data.portfolioId").value(portfolioId))
                        .andExpect(jsonPath("$.data.summary").isNotEmpty())
                        .andExpect(jsonPath("$.data.riskLevel").exists())
                        .andExpect(jsonPath("$.data.observations").isArray())
                        .andExpect(jsonPath("$.data.disclaimer")
                                .value("Educational insights only. Not financial advice."))
                        .andReturn();

        String analysisId =
                objectMapper
                        .readTree(generateResult.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

        mockMvc.perform(get("/api/ai/analyses").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(
                        get("/api/ai/analyses/" + analysisId)
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(analysisId));
    }

    @Test
    void otherUserCannotAccessAnalysis() throws Exception {
        String tokenA = registerAndGetToken("ai-a+" + System.currentTimeMillis() + "@example.com");
        String tokenB = registerAndGetToken("ai-b+" + System.currentTimeMillis() + "@example.com");
        String portfolioId = createPortfolio(tokenA);

        MvcResult result =
                mockMvc.perform(
                                post("/api/ai/portfolio-summary/" + portfolioId)
                                        .header("Authorization", "Bearer " + tokenA))
                        .andExpect(status().isCreated())
                        .andReturn();

        String analysisId =
                objectMapper
                        .readTree(result.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

        mockMvc.perform(
                        get("/api/ai/analyses/" + analysisId)
                                .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
    }

    private String createPortfolio(String token) throws Exception {
        MvcResult result =
                mockMvc.perform(
                                post("/api/portfolios")
                                        .header("Authorization", "Bearer " + token)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of("name", "AI Test Portfolio"))))
                        .andExpect(status().isCreated())
                        .andReturn();

        return objectMapper
                .readTree(result.getResponse().getContentAsString())
                .path("data")
                .path("id")
                .asText();
    }

    private String registerAndGetToken(String email) throws Exception {
        mockMvc.perform(
                        post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "fullName",
                                                        "AI User",
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
