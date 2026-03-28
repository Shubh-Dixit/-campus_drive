package com.campusdrive.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String answer;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    // Tipo de pregunta: THEORY o CODING (default THEORY)
    private String questionType = "THEORY";

    // === Campos exclusivos para CODING ===
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
