package com.campusdrive.service.impl;

import com.campusdrive.dto.LeaderboardEntry;
import com.campusdrive.entity.*;
import com.campusdrive.exception.ResourceNotFoundException;
import com.campusdrive.repository.*;
import com.campusdrive.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private static final Logger logger = LoggerFactory.getLogger(ActivityServiceImpl.class);

    private final ActivityRepository activityRepository;
    private final BookmarkRepository bookmarkRepository;
    private final QuestionRepository questionRepository;

    @Override
    @Transactional
    public void markCompleted(Long questionId, User user) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + questionId));

        // Operación idempotente: si ya existe, actualizar; si no, crear
        Optional<Activity> existing = activityRepository.findByUserAndQuestion(user, question);

        if (existing.isPresent()) {
            Activity activity = existing.get();
            activity.setCompleted(!activity.isCompleted());
            activityRepository.save(activity);
            logger.info("Activity toggled for user {} on question {}", user.getId(), questionId);
        } else {
            Activity activity = Activity.builder()
                    .user(user)
                    .question(question)
                    .completed(true)
                    .build();
            activityRepository.save(activity);
            logger.info("Activity created for user {} on question {}", user.getId(), questionId);
        }
    }

    @Override
    @Transactional
    public void toggleBookmark(Long questionId, User user) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + questionId));

        // Toggle: si existe, eliminar; si no, crear
        Optional<Bookmark> existing = bookmarkRepository.findByUserAndQuestion(user, question);

        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            logger.info("Bookmark removed for user {} on question {}", user.getId(), questionId);
        } else {
            Bookmark bookmark = Bookmark.builder()
                    .user(user)
                    .question(question)
                    .build();
            bookmarkRepository.save(bookmark);
            logger.info("Bookmark added for user {} on question {}", user.getId(), questionId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard() {
        List<Object[]> results = activityRepository.getLeaderboard();
        List<LeaderboardEntry> leaderboard = new ArrayList<>();

        int rank = 1;
        for (Object[] row : results) {
            leaderboard.add(LeaderboardEntry.builder()
                    .userId((Long) row[0])
                    .userName((String) row[1])
                    .completedCount((Long) row[2])
                    .rank(rank++)
                    .build());
        }

        return leaderboard;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getCompletedQuestionIds(User user) {
        return activityRepository.findByUserAndCompleted(user, true)
                .stream()
                .map(a -> a.getQuestion().getId())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getBookmarkedQuestionIds(User user) {
        return bookmarkRepository.findByUser(user)
                .stream()
                .map(b -> b.getQuestion().getId())
                .collect(Collectors.toList());
    }
}
