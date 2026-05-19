package com.aurex.backend.portfolio.repository;

import com.aurex.backend.portfolio.entity.Transaction;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByPortfolioIdOrderByTransactionDateDesc(UUID portfolioId);

    @Query(
            """
            SELECT t FROM Transaction t
            JOIN FETCH t.asset
            WHERE t.portfolio.id = :portfolioId
            ORDER BY t.transactionDate DESC, t.createdAt DESC
            """)
    List<Transaction> findByPortfolioIdWithAssetOrderByTransactionDateDesc(
            @Param("portfolioId") UUID portfolioId);

    @Query(
            """
            SELECT t FROM Transaction t
            JOIN FETCH t.asset
            WHERE t.portfolio.id = :portfolioId
            ORDER BY t.transactionDate ASC, t.createdAt ASC
            """)
    List<Transaction> findByPortfolioIdWithAssetOrderByTransactionDateAsc(
            @Param("portfolioId") UUID portfolioId);

    @Query(
            """
            SELECT t FROM Transaction t
            JOIN FETCH t.portfolio p
            JOIN FETCH t.asset
            WHERE t.id = :id AND p.user.id = :userId
            """)
    Optional<Transaction> findByIdAndPortfolio_User_Id(
            @Param("id") UUID id, @Param("userId") UUID userId);
}
