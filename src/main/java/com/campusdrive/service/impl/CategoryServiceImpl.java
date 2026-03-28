package com.campusdrive.service.impl;

import com.campusdrive.dto.CategoryRequest;
import com.campusdrive.entity.Category;
import com.campusdrive.exception.DuplicateResourceException;
import com.campusdrive.exception.ResourceNotFoundException;
import com.campusdrive.repository.CategoryRepository;
import com.campusdrive.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryServiceImpl.class);
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Category createCategory(CategoryRequest request) {
        // Verificación idempotente
        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException(
                    "Category already exists with name: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Category saved = categoryRepository.save(category);
        logger.info("Category created: {}", saved.getName());
        return saved;
    }

    @Override
    @Transactional
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + id));

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + id));
        categoryRepository.delete(category);
        logger.info("Category deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
