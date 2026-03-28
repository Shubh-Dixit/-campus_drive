package com.campusdrive.repository;

import com.campusdrive.entity.Question;
import com.campusdrive.entity.Category;
import com.campusdrive.entity.Difficulty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    boolean existsByTitleAndCategory(String title, Category category);

    Page<Question> findByCategory(Category category, Pageable pageable);

    Page<Question> findByDifficulty(Difficulty difficulty, Pageable pageable);

    Page<Question> findByCategoryAndDifficulty(Category category, Difficulty difficulty, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE " +
           "LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Question> searchQuestions(@Param("search") String search, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:categoryId IS NULL OR q.category.id = :categoryId) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty)")
    Page<Question> findByFilters(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("difficulty") Difficulty difficulty,
            Pageable pageable);

    long countByDifficulty(Difficulty difficulty);

    long countByCategory(Category category);
}
