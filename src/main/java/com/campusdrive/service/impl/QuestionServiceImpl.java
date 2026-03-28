package com.campusdrive.service.impl;

import com.campusdrive.dto.QuestionDto;
import com.campusdrive.dto.QuestionRequest;
import com.campusdrive.entity.*;
import com.campusdrive.exception.DuplicateResourceException;
import com.campusdrive.exception.ResourceNotFoundException;
import com.campusdrive.repository.*;
import com.campusdrive.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private static final Logger logger = LoggerFactory.getLogger(QuestionServiceImpl.class);

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final BookmarkRepository bookmarkRepository;
    private final ActivityRepository activityRepository;

    @Override
    @Transactional
    public QuestionDto createQuestion(QuestionRequest request, User createdBy) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        // Verificación idempotente: evitar pregunta duplicada en misma categoría
        if (questionRepository.existsByTitleAndCategory(request.getTitle(), category)) {
            throw new DuplicateResourceException(
                    "Question already exists with title '" + request.getTitle()
                    + "' in category '" + category.getName() + "'");
        }

        Difficulty difficulty = Difficulty.valueOf(request.getDifficulty().toUpperCase());
        QuestionType questionType = QuestionType.valueOf(
                (request.getQuestionType() != null ? request.getQuestionType() : "THEORY").toUpperCase());

        Question question = Question.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .answer(request.getAnswer())
                .difficulty(difficulty)
                .questionType(questionType)
                .category(category)
                .createdBy(createdBy)
                .build();

        // Si es pregunta de tipo CODING, establecer campos adicionales
        if (questionType == QuestionType.CODING) {
            question.setInputFormat(request.getInputFormat());
            question.setOutputFormat(request.getOutputFormat());
            question.setConstraints(request.getConstraints());
            question.setSampleInput(request.getSampleInput());
            question.setSampleOutput(request.getSampleOutput());
            question.setTimeLimitMs(request.getTimeLimitMs() != null ? request.getTimeLimitMs() : 1000);
            question.setMemoryLimitMb(request.getMemoryLimitMb() != null ? request.getMemoryLimitMb() : 256);
            question.setBoilerplateCode(request.getBoilerplateCode());
            question.setProgrammingLanguage(request.getProgrammingLanguage());
        }

        Question saved = questionRepository.save(question);
        logger.info("Question created: {}", saved.getId());
        return mapToDto(saved, null);
    }

    @Override
    @Transactional
    public QuestionDto updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        QuestionType questionType = QuestionType.valueOf(
                (request.getQuestionType() != null ? request.getQuestionType() : "THEORY").toUpperCase());

        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());
        question.setAnswer(request.getAnswer());
        question.setDifficulty(Difficulty.valueOf(request.getDifficulty().toUpperCase()));
        question.setQuestionType(questionType);
        question.setCategory(category);

        // Actualizar campos de CODING (limpiar si se cambia a THEORY)
        if (questionType == QuestionType.CODING) {
            question.setInputFormat(request.getInputFormat());
            question.setOutputFormat(request.getOutputFormat());
            question.setConstraints(request.getConstraints());
            question.setSampleInput(request.getSampleInput());
            question.setSampleOutput(request.getSampleOutput());
            question.setTimeLimitMs(request.getTimeLimitMs() != null ? request.getTimeLimitMs() : 1000);
            question.setMemoryLimitMb(request.getMemoryLimitMb() != null ? request.getMemoryLimitMb() : 256);
            question.setBoilerplateCode(request.getBoilerplateCode());
            question.setProgrammingLanguage(request.getProgrammingLanguage());
        } else {
            question.setInputFormat(null);
            question.setOutputFormat(null);
            question.setConstraints(null);
            question.setSampleInput(null);
            question.setSampleOutput(null);
            question.setTimeLimitMs(null);
            question.setMemoryLimitMb(null);
            question.setBoilerplateCode(null);
            question.setProgrammingLanguage(null);
        }

        Question updated = questionRepository.save(question);
        logger.info("Question updated: {}", updated.getId());
        return mapToDto(updated, null);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + id));
        questionRepository.delete(question);
        logger.info("Question deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionDto getQuestionById(Long id, User currentUser) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Question not found with id: " + id));
        return mapToDto(question, currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<QuestionDto> getQuestions(String search, Long categoryId,
                                          String difficulty, Pageable pageable,
                                          User currentUser) {
        Difficulty diff = null;
        if (difficulty != null && !difficulty.isEmpty()) {
            diff = Difficulty.valueOf(difficulty.toUpperCase());
        }

        String searchTerm = (search != null && !search.isEmpty()) ? search : "";

        Page<Question> questions = questionRepository.findByFilters(
                searchTerm, categoryId, diff, pageable);

        return questions.map(q -> mapToDto(q, currentUser));
    }

    /**
     * Convierte entidad Question a DTO, incluyendo estado de bookmark y actividad
     * del usuario actual (si está autenticado).
     */
    private QuestionDto mapToDto(Question question, User currentUser) {
        boolean isBookmarked = false;
        boolean isCompleted = false;

        if (currentUser != null) {
            isBookmarked = bookmarkRepository.existsByUserAndQuestion(
                    currentUser, question);
            isCompleted = activityRepository.existsByUserAndQuestion(
                    currentUser, question);
        }

        return QuestionDto.builder()
                .id(question.getId())
                .title(question.getTitle())
                .description(question.getDescription())
                .answer(question.getAnswer())
                .difficulty(question.getDifficulty().name())
                .questionType(question.getQuestionType().name())
                .categoryId(question.getCategory().getId())
                .categoryName(question.getCategory().getName())
                .createdByName(question.getCreatedBy() != null
                        ? question.getCreatedBy().getName() : null)
                .createdAt(question.getCreatedAt() != null
                        ? question.getCreatedAt().toString() : null)
                .bookmarked(isBookmarked)
                .completed(isCompleted)
                // Campos de CODING
                .inputFormat(question.getInputFormat())
                .outputFormat(question.getOutputFormat())
                .constraints(question.getConstraints())
                .sampleInput(question.getSampleInput())
                .sampleOutput(question.getSampleOutput())
                .timeLimitMs(question.getTimeLimitMs())
                .memoryLimitMb(question.getMemoryLimitMb())
                .boilerplateCode(question.getBoilerplateCode())
                .programmingLanguage(question.getProgrammingLanguage())
                .build();
    }
}
