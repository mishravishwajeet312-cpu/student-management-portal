package com.example.studenttable.controller;

import com.example.studenttable.entity.Question;
import com.example.studenttable.entity.Quiz;
import com.example.studenttable.repository.QuestionRepository;
import com.example.studenttable.repository.QuizRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AdminController {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    public AdminController(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @PostMapping("/quizzes")
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz) {
        String validationError = validateQuiz(quiz);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(validationError));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(quizRepository.save(quiz));
    }

    @PutMapping("/quizzes/{quizId}")
    public ResponseEntity<?> updateQuiz(@PathVariable Integer quizId, @RequestBody Quiz request) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Quiz not found"));
        }
        String validationError = validateQuiz(request);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(validationError));
        }
        Quiz existing = quizOpt.get();
        existing.setTitle(request.getTitle());
        existing.setType(request.getType());
        existing.setTotalQuestions(request.getTotalQuestions());
        Quiz saved = quizRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Integer quizId) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Quiz not found"));
        }
        quizRepository.deleteById(quizId);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted"));
    }

    @PostMapping("/questions")
    public ResponseEntity<?> createQuestion(@RequestBody Question question) {
        if (question.getQuiz() == null || question.getQuiz().getQuizId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("quizId is required"));
        }

        Integer quizId = question.getQuiz().getQuizId();
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Quiz not found"));
        }

        question.setQuiz(quizOpt.get());
        Question saved = questionRepository.save(question);
        return ResponseEntity.ok(saved);
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }

    private String validateQuiz(Quiz quiz) {
        if (quiz.getTitle() == null || quiz.getTitle().isBlank()) {
            return "Title is required";
        }
        if (quiz.getType() == null || quiz.getType().isBlank()) {
            return "Type is required";
        }
        String type = quiz.getType().trim().toLowerCase();
        if (!Arrays.asList("manual", "external").contains(type)) {
            return "Type must be manual or external";
        }
        if (quiz.getTotalQuestions() == null || quiz.getTotalQuestions() <= 0) {
            return "Total questions must be greater than 0";
        }
        return null;
    }
}
