package com.example.studenttable.controller;

import com.example.studenttable.entity.Question;
import com.example.studenttable.entity.Quiz;
import com.example.studenttable.repository.QuestionRepository;
import com.example.studenttable.repository.QuizRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuestionController(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<?> addQuestion(
            @PathVariable Integer quizId,
            @RequestBody Question request
    ) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Quiz not found"));
        }

        String validationError = validateQuestion(request);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(validationError));
        }

        request.setQuestionId(null);
        request.setQuiz(quizOpt.get());
        Question saved = questionRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Integer questionId,
            @RequestBody Question request
    ) {
        Optional<Question> questionOpt = questionRepository.findById(questionId);
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Question not found"));
        }

        String validationError = validateQuestion(request);
        if (validationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error(validationError));
        }

        Question existing = questionOpt.get();
        existing.setQuestionText(request.getQuestionText());
        existing.setOption1(request.getOption1());
        existing.setOption2(request.getOption2());
        existing.setOption3(request.getOption3());
        existing.setOption4(request.getOption4());
        existing.setCorrectOption(request.getCorrectOption());

        Question saved = questionRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Integer questionId) {
        Optional<Question> questionOpt = questionRepository.findById(questionId);
        if (questionOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Question not found"));
        }

        questionRepository.deleteById(questionId);
        return ResponseEntity.ok(Map.of("message", "Question deleted"));
    }

    private String validateQuestion(Question request) {
        if (request.getQuestionText() == null || request.getQuestionText().isBlank()) {
            return "questionText is required";
        }
        if (request.getOption1() == null || request.getOption1().isBlank()
                || request.getOption2() == null || request.getOption2().isBlank()
                || request.getOption3() == null || request.getOption3().isBlank()
                || request.getOption4() == null || request.getOption4().isBlank()) {
            return "All options are required";
        }
        if (request.getCorrectOption() == null || request.getCorrectOption() < 1 || request.getCorrectOption() > 4) {
            return "correctOption must be between 1 and 4";
        }
        return null;
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }
}
