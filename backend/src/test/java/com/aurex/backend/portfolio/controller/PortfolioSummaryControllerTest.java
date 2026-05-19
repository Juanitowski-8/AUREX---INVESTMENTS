package com.aurex.backend.portfolio.controller;

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
class PortfolioSummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void portfolioSummaryWithHoldings() throws Exception {
        String token = registerAndGetToken("summary+" + System.currentTimeMillis() + "@example.com");
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
                                                        0.5,
                                                        "price",
                                                        60000,
                                                        "transactionDate",
                                                        "2026-05-18T10:00:00Z"))))
                .andExpect(status().isCreated());

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
                                                        "ETH",
                                                        "type",
                                                        "BUY",
                                                        "quantity",
                                                        2,
                                                        "price",
                                                        3000,
                                                        "transactionDate",
                                                        "2026-05-18T11:00:00Z"))))
                .andExpect(status().isCreated());

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId + "/summary")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.portfolioId").value(portfolioId))
                .andExpect(jsonPath("$.data.totalCost").value(36000.0))
                .andExpect(jsonPath("$.data.totalValue").value(41253.85))
                .andExpect(jsonPath("$.data.totalPnL").value(5253.85))
                .andExpect(jsonPath("$.data.allocation.length()").value(2))
                .andExpect(jsonPath("$.data.bestAsset.symbol").exists())
                .andExpect(jsonPath("$.data.riskLevel").exists());
    }

    @Test
    void summaryForOtherUsersPortfolioReturnsNotFound() throws Exception {
        String tokenA = registerAndGetToken("sum-a+" + System.currentTimeMillis() + "@example.com");
        String tokenB = registerAndGetToken("sum-b+" + System.currentTimeMillis() + "@example.com");
        String portfolioId = createPortfolio(tokenA);

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId + "/summary")
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
                                                        Map.of("name", "Core Growth Portfolio"))))
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
                                                        "Summary User",
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
