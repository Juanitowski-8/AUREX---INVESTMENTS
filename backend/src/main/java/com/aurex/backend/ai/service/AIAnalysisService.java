package com.aurex.backend.ai.service;

import com.aurex.backend.ai.dto.AIAnalysisResponse;
import com.aurex.backend.ai.dto.LLMAnalysisResult;
import com.aurex.backend.ai.dto.PortfolioAnalysisContext;
import com.aurex.backend.ai.entity.AIAnalysis;
import com.aurex.backend.ai.mapper.AIAnalysisMapper;
import com.aurex.backend.ai.repository.AIAnalysisRepository;
import com.aurex.backend.ai.service.llm.LLMProvider;
import com.aurex.backend.common.exception.ResourceNotFoundException;
import com.aurex.backend.common.security.AuthenticatedUserProvider;
import com.aurex.backend.portfolio.dto.PortfolioSummaryResponse;
import com.aurex.backend.portfolio.entity.Portfolio;
import com.aurex.backend.portfolio.service.PortfolioService;
import com.aurex.backend.portfolio.service.PortfolioSummaryService;
import com.aurex.backend.user.entity.User;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final AIAnalysisRepository aiAnalysisRepository;
    private final PortfolioService portfolioService;
    private final PortfolioSummaryService portfolioSummaryService;
    private final LLMProvider llmProvider;
    private final AIAnalysisMapper aiAnalysisMapper;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @Transactional
    public AIAnalysisResponse generatePortfolioSummary(UUID portfolioId) {
        Portfolio portfolio = portfolioService.getOwnedPortfolio(portfolioId);
        PortfolioSummaryResponse summary = portfolioSummaryService.getSummary(portfolioId);

        PortfolioAnalysisContext context = PortfolioAnalysisContext.from(summary);
        log.debug("Generating AI analysis via provider={}", llmProvider.getProviderName());

        LLMAnalysisResult generated = llmProvider.generateAnalysis(context);

        AIAnalysis analysis =
                AIAnalysis.builder()
                        .portfolio(portfolio)
                        .summary(generated.summary())
                        .riskLevel(generated.riskLevel())
                        .concentrationNotes(generated.concentrationNotes())
                        .observations(aiAnalysisMapper.serializeObservations(generated.observations()))
                        .disclaimer(generated.disclaimer())
                        .build();

        AIAnalysis saved = aiAnalysisRepository.save(analysis);
        return aiAnalysisMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AIAnalysisResponse> listForCurrentUser() {
        User user = authenticatedUserProvider.getCurrentUser();
        return aiAnalysisRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(aiAnalysisMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AIAnalysisResponse getById(UUID id) {
        User user = authenticatedUserProvider.getCurrentUser();
        AIAnalysis analysis =
                aiAnalysisRepository
                        .findByIdAndUserId(id, user.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));
        return aiAnalysisMapper.toResponse(analysis);
    }
}
