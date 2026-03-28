package com.campusdrive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;
    private String title;
    private String description;
    private String answer;
    private String difficulty;
    private String questionType;
    private Long categoryId;
    private String categoryName;
    private String createdByName;
    private String createdAt;
    private boolean bookmarked;
    private boolean completed;

    // Campos de CODING
    private String inputFormat;
    private String outputFormat;
    private String constraints;
    private String sampleInput;
    private String sampleOutput;
    private Integer timeLimitMs;
    private Integer memoryLimitMb;
    private String boilerplateCode;
    private String programmingLanguage;
}
