package com.campusdrive.controller;

import com.campusdrive.dto.DashboardStats;
import com.campusdrive.dto.LeaderboardEntry;
import com.campusdrive.entity.User;
import com.campusdrive.security.CustomUserDetails;
import com.campusdrive.service.ActivityService;
import com.campusdrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final UserService userService;

    @PostMapping("/activity/{questionId}/complete")
    public ResponseEntity<Map<String, String>> markCompleted(
            @PathVariable Long questionId,
            Authentication authentication) {
        User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        activityService.markCompleted(questionId, user);
        return ResponseEntity.ok(Map.of("message", "Activity updated"));
    }

    @PostMapping("/bookmarks/{questionId}/toggle")
    public ResponseEntity<Map<String, String>> toggleBookmark(
            @PathVariable Long questionId,
            Authentication authentication) {
        User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        activityService.toggleBookmark(questionId, user);
        return ResponseEntity.ok(Map.of("message", "Bookmark toggled"));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        return ResponseEntity.ok(activityService.getLeaderboard());
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStats> getUserDashboardStats(
            Authentication authentication) {
        User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        return ResponseEntity.ok(userService.getDashboardStats(user));
    }

    @GetMapping("/activity/completed")
    public ResponseEntity<List<Long>> getCompletedQuestionIds(
            Authentication authentication) {
        User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        return ResponseEntity.ok(activityService.getCompletedQuestionIds(user));
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<List<Long>> getBookmarkedQuestionIds(
            Authentication authentication) {
        User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        return ResponseEntity.ok(activityService.getBookmarkedQuestionIds(user));
    }
}
