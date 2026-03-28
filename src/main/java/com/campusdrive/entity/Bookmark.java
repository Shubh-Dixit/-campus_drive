package com.campusdrive.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Marcadores/Bookmarks del usuario. 
 * UNIQUE(user_id, question_id) evita duplicados.
 */
@Entity
@Table(name = "bookmarks",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"user_id", "question_id"},
           name = "uk_bookmark_user_question"
       ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "bookmarked_at", updatable = false)
    private LocalDateTime bookmarkedAt;

    @PrePersist
    protected void onCreate() {
        this.bookmarkedAt = LocalDateTime.now();
    }
}
