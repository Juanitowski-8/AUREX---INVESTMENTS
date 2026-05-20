package com.aurex.backend.alert.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class AlertControllerTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private ObjectMapper objectMapper;

    @Test
    void alertCrudFlow() throws Exception {
        String token = registerAndGetToken("alert+" + System.currentTimeMillis() + "@example.com");

        MvcResult createResult =
                mockMvc.perform(
                                post("/api/alerts")
                                        .header("Authorization", "Bearer " + token)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of(
                                                                "assetSymbol",
                                                                "BTC",
                                                                "conditionType",
                                                                "ABOVE",
                                                                "targetPrice",
                                                                70000))))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.data.assetSymbol").value("BTC"))
                        .andExpect(jsonPath("$.data.conditionType").value("ABOVE"))
                        .andExpect(jsonPath("$.data.enabled").value(true))
                        .andReturn();

        String alertId =
                objectMapper
                        .readTree(createResult.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

        mockMvc.perform(get("/api/alerts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(
                        put("/api/alerts/" + alertId)
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("conditionType", "BELOW", "targetPrice", 65000))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.conditionType").value("BELOW"));

        mockMvc.perform(
                        patch("/api/alerts/" + alertId + "/toggle")
                                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enabled").value(false));

        mockMvc.perform(
                        get("/api/alerts/events").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(
                        delete("/api/alerts/" + alertId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void createWithInvalidPriceReturnsBadRequest() throws Exception {
        String token = registerAndGetToken("alert-bad+" + System.currentTimeMillis() + "@example.com");

        mockMvc.perform(
                        post("/api/alerts")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of(
                                                        "assetSymbol",
                                                        "ETH",
                                                        "conditionType",
                                                        "ABOVE",
                                                        "targetPrice",
                                                        0))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void accessOtherUsersAlertReturnsNotFound() throws Exception {
        String tokenA = registerAndGetToken("alert-a+" + System.currentTimeMillis() + "@example.com");
        String tokenB = registerAndGetToken("alert-b+" + System.currentTimeMillis() + "@example.com");

        MvcResult createResult =
                mockMvc.perform(
                                post("/api/alerts")
                                        .header("Authorization", "Bearer " + tokenA)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                objectMapper.writeValueAsString(
                                                        Map.of(
                                                                "assetSymbol",
                                                                "SOL",
                                                                "conditionType",
                                                                "ABOVE",
                                                                "targetPrice",
                                                                200))))
                        .andExpect(status().isCreated())
                        .andReturn();

        String alertId =
                objectMapper
                        .readTree(createResult.getResponse().getContentAsString())
                        .path("data")
                        .path("id")
                        .asText();

        mockMvc.perform(
                        put("/api/alerts/" + alertId)
                                .header("Authorization", "Bearer " + tokenB)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        objectMapper.writeValueAsString(
                                                Map.of("conditionType", "BELOW", "targetPrice", 100))))
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
                                                        "Alert User",
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
