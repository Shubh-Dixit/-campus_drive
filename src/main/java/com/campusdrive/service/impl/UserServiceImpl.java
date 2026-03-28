package com.campusdrive.service.impl;

import com.campusdrive.dto.*;
import com.campusdrive.entity.*;
import com.campusdrive.exception.DuplicateResourceException;
import com.campusdrive.exception.ResourceNotFoundException;
import com.campusdrive.repository.*;
import com.campusdrive.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final ActivityRepository activityRepository;
    private final BookmarkRepository bookmarkRepository;

    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        // Verificación idempotente
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "User already exists with email: " + request.getEmail());
        }

        Role role = Role.valueOf(request.getRole().toUpperCase());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User saved = userRepository.save(user);
        logger.info("User created by admin: {} with role {}", saved.getEmail(), role);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));
        userRepository.delete(user);
        logger.info("User deleted: {}", id);
    }

    @Override
    @Transactional
    public UserDto updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + id));

        user.setRole(Role.valueOf(role.toUpperCase()));
        User updated = userRepository.save(user);
        logger.info("User role updated: {} -> {}", id, role);
        return mapToDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats(User currentUser) {
        Map<String, Long> difficultyBreakdown = new HashMap<>();
        difficultyBreakdown.put("EASY", questionRepository.countByDifficulty(Difficulty.EASY));
        difficultyBreakdown.put("MEDIUM", questionRepository.countByDifficulty(Difficulty.MEDIUM));
        difficultyBreakdown.put("HARD", questionRepository.countByDifficulty(Difficulty.HARD));

        long completedByUser = 0;
        long bookmarkedByUser = 0;

        if (currentUser != null) {
            completedByUser = activityRepository.countByUserAndCompleted(currentUser, true);
            bookmarkedByUser = bookmarkRepository.findByUser(currentUser).size();
        }

        return DashboardStats.builder()
                .totalQuestions(questionRepository.count())
                .totalUsers(userRepository.count())
                .totalCategories(categoryRepository.count())
                .difficultyBreakdown(difficultyBreakdown)
                .completedByUser(completedByUser)
                .bookmarkedByUser(bookmarkedByUser)
                .build();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt() != null
                        ? user.getCreatedAt().toString() : null)
                .build();
    }
}
