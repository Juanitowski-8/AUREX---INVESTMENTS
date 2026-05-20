package com.aurex.backend.portfolio.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void buySellHoldingsAndDeleteTransactionFlow() throws Exception {
        String token = registerAndGetToken("tx+" + System.currentTimeMillis() + "@example.com");
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
                                                        0.25,
                                                        "price",
                                                        65000,
                                                        "transactionDate",
                                                        "2026-05-18T10:00:00Z",
                                                        "notes",
                                                        "Initial BTC position"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type").value("BUY"))
                .andExpect(jsonPath("$.data.assetSymbol").value("BTC"));

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId + "/holdings")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].quantity").value(0.25))
                .andExpect(jsonPath("$.data[0].averageBuyPrice").value(65000));

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
                                                        0.25,
                                                        "price",
                                                        70000,
                                                        "transactionDate",
                                                        "2026-05-19T10:00:00Z"))))
                .andExpect(status().isCreated());

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId + "/holdings")
                                .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.data[0].quantity").value(0.5))
                .andExpect(jsonPath("$.data[0].averageBuyPrice").value(67500));

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
                                                        "SELL",
                                                        "quantity",
                                                        0.5,
                                                        "price",
                                                        72000,
                                                        "transactionDate",
                                                        "2026-05-20T10:00:00Z"))))
                .andExpect(status().isCreated());

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId + "/holdings")
                                .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.data.length()").value(0));

        mockMvc.perform(
                        get("/api/transactions")
                                .param("portfolioId", portfolioId)
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(3));
    }

    @Test
    void sellMoreThanAvailableReturnsBadRequest() throws Exception {
        String token = registerAndGetToken("sell+" + System.currentTimeMillis() + "@example.com");
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
                                                        "ETH",
                                                        "type",
                                                        "BUY",
                                                        "quantity",
                                                        1,
                                                        "price",
                                                        3000,
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
                                                        "SELL",
                                                        "quantity",
                                                        2,
                                                        "price",
                                                        3100,
                                                        "transactionDate",
                                                        "2026-05-19T10:00:00Z"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INSUFFICIENT_HOLDING"));
    }

    @Test
    void deleteTransactionRecalculatesHoldings() throws Exception {
        String token = registerAndGetToken("del+" + System.currentTimeMillis() + "@example.com");
        String portfolioId = createPortfolio(token);

        MvcResult firstBuy =
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
                                                                "SOL",
                                                                "type",
                                                                "BUY",
                                                                "quantity",
                                                                10,
                                                                "price",
                                                                100,
                                                                "transactionDate",
                                                                "2026-05-18T10:00:00Z"))))
                        .andExpect(status().isCreated())
                        .andReturn();

        String firstTxId =
                objectMapper
                        .readTree(firstBuy.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

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
                                                        "SOL",
                                                        "type",
                                                        "BUY",
                                                        "quantity",
                                                        5,
                                                        "price",
                                                        120,
                                                        "transactionDate",
                                                        "2026-05-19T10:00:00Z"))))
                .andExpect(status().isCreated());

        mockMvc.perform(
                        delete("/api/transactions/" + firstTxId)
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(
                        get("/api/portfolios/" + portfolioId + "/holdings")
                                .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].quantity").value(5))
                .andExpect(jsonPath("$.data[0].averageBuyPrice").value(120));
    }

    private String createPortfolio(String token) throws Exception {
        MvcResult result =
                mockMvc.perform(
                                post("/api/portfolios")
                                        .header("Authorization", "Bearer " + token)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of("name", "Trading Portfolio"))))
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
                                                        "Tx User",
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
