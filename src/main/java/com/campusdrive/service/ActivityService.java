package com.campusdrive.service;

import com.campusdrive.dto.LeaderboardEntry;
import com.campusdrive.entity.User;
import java.util.List;

public interface ActivityService {
    void markCompleted(Long questionId, User user);
    void toggleBookmark(Long questionId, User user);
    List<LeaderboardEntry> getLeaderboard();
    List<Long> getCompletedQuestionIds(User user);
    List<Long> getBookmarkedQuestionIds(User user);
}
