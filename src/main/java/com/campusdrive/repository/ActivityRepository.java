package com.campusdrive.repository;

import com.campusdrive.entity.Activity;
import com.campusdrive.entity.User;
import com.campusdrive.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    Optional<Activity> findByUserAndQuestion(User user, Question question);

    boolean existsByUserAndQuestion(User user, Question question);

    List<Activity> findByUser(User user);

    List<Activity> findByUserAndCompleted(User user, boolean completed);

    long countByUserAndCompleted(User user, boolean completed);

    @Query("SELECT a.user.id, a.user.name, COUNT(a) as total " +
           "FROM Activity a WHERE a.completed = true " +
           "GROUP BY a.user.id, a.user.name ORDER BY total DESC")
    List<Object[]> getLeaderboard();
}
