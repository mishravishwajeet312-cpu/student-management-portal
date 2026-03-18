package com.example.studenttable;

import com.example.studenttable.entity.Quiz;
import com.example.studenttable.repository.QuizRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class StudentTableApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentTableApplication.class, args);
    }

    @Bean
    CommandLineRunner seedExternalQuiz(QuizRepository quizRepository) {
        return args -> {
            if (!quizRepository.existsByTypeIgnoreCase("external")) {
                Quiz quiz = new Quiz();
                quiz.setTitle("Video Game Quiz");
                quiz.setType("external");
                quiz.setTotalQuestions(10);
                quizRepository.save(quiz);
            }
        };
    }
}
