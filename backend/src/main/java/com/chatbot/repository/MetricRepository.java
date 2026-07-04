package com.chatbot.repository;

import com.chatbot.entity.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {

    @Query("SELECT m.model as model, " +
           "AVG(m.latencyMs) as avgLatency, " +
           "AVG(m.accuracyScore) as avgAccuracy, " +
           "COUNT(m) as totalQueries " +
           "FROM Metric m " +
           "WHERE m.recordedAt >= ?1 " +
           "GROUP BY m.model")
    List<Map<String, Object>> getModelComparison(LocalDateTime sinceDate);
}
