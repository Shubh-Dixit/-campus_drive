package com.campusdrive.repository;

import com.campusdrive.entity.Bookmark;
import com.campusdrive.entity.User;
import com.campusdrive.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    Optional<Bookmark> findByUserAndQuestion(User user, Question question);

    boolean existsByUserAndQuestion(User user, Question question);

    List<Bookmark> findByUser(User user);

    void deleteByUserAndQuestion(User user, Question question);
}
