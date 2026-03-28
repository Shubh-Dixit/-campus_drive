package com.campusdrive.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Categoría de preguntas con nombre único.
 * Evita duplicados mediante constraint UNIQUE en la columna name.
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
}
