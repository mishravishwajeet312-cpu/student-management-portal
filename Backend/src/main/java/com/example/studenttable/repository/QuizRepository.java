package com.example.studenttable.repository;

import com.example.studenttable.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    boolean existsByTypeIgnoreCase(String type);
}
