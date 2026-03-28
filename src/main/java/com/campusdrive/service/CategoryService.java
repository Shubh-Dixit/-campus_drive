package com.campusdrive.service;

import com.campusdrive.dto.CategoryRequest;
import com.campusdrive.entity.Category;
import java.util.List;

public interface CategoryService {
    Category createCategory(CategoryRequest request);
    Category updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
    Category getCategoryById(Long id);
    List<Category> getAllCategories();
}
