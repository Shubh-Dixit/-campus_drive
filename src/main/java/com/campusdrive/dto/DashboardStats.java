package com.campusdrive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalQuestions;
    private long totalUsers;
    private long totalCategories;
    private Map<String, Long> difficultyBreakdown;
    private long completedByUser;
    private long bookmarkedByUser;
}
