package com.campusdrive.service;

import com.campusdrive.dto.QuestionDto;
import com.campusdrive.dto.QuestionRequest;
import com.campusdrive.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuestionService {
    QuestionDto createQuestion(QuestionRequest request, User createdBy);
    QuestionDto updateQuestion(Long id, QuestionRequest request);
    void deleteQuestion(Long id);
    QuestionDto getQuestionById(Long id, User currentUser);
    Page<QuestionDto> getQuestions(String search, Long categoryId,
                                   String difficulty, boolean bookmarkedOnly, Pageable pageable, User currentUser);
}
