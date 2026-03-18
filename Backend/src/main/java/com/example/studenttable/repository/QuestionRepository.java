package com.example.studenttable.repository;

import com.example.studenttable.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {

    List<Question> findByQuizQuizId(Integer quizId);

}
