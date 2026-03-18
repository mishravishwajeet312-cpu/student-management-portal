package com.example.studenttable.controller;

import com.example.studenttable.entity.Question;
import com.example.studenttable.entity.Quiz;
import com.example.studenttable.entity.Result;
import com.example.studenttable.repository.QuestionRepository;
import com.example.studenttable.repository.QuizRepository;
import com.example.studenttable.repository.ResultRepository;
import com.example.studenttable.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ResultRepository resultRepository;
    private final StudentRepository studentRepository;

    public QuizController(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            ResultRepository resultRepository,
            StudentRepository studentRepository
    ) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/quizzes")
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<?> getQuizQuestions(@PathVariable Integer quizId) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Quiz not found"));
        }

        Quiz quiz = quizOpt.get();
        if ("manual".equalsIgnoreCase(quiz.getType())) {
            List<Question> questions = questionRepository.findByQuizQuizId(quizId);
            Collections.shuffle(questions);
            return ResponseEntity.ok(questions);
        }

        if ("external".equalsIgnoreCase(quiz.getType())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error("External quiz API is disabled. Use the local JSON quiz source."));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Unsupported quiz type"));
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Integer quizId,
            @RequestParam Long studentId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        Optional<Quiz> quizOpt = quizRepository.findById(quizId);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Quiz not found"));
        }

        if (studentId == null || studentId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("studentId is invalid"));
        }

        var studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("Student not found"));
        }

        Map<String, Object> answers = body != null ? body : Collections.emptyMap();
        Quiz quiz = quizOpt.get();

        int score = 0;
        int total = 0;
        List<Map<String, Object>> details = new ArrayList<>();

        if ("manual".equalsIgnoreCase(quiz.getType())) {
            List<Question> questions = questionRepository.findByQuizQuizId(quizId);
            total = questions.size();
            for (Question question : questions) {
                Integer selectedOption = parseIntAnswer(answers.get(String.valueOf(question.getQuestionId())));
                boolean correct = selectedOption != null && selectedOption.equals(question.getCorrectOption());
                if (correct) {
                    score++;
                }
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("questionId", question.getQuestionId());
                item.put("selectedOption", selectedOption);
                item.put("correctOption", question.getCorrectOption());
                item.put("correct", correct);
                details.add(item);
            }
        } else if ("external".equalsIgnoreCase(quiz.getType())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error("External quiz scoring is disabled. Score locally on the client."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Unsupported quiz type"));
        }

        Result result = new Result();
        result.setStudent(studentOpt.get());
        result.setQuiz(quiz);
        result.setScore(score);
        result.setTotal(total);

        Result saved = resultRepository.save(result);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("resultId", saved.getResultId());
        payload.put("studentId", saved.getStudent().getId());
        payload.put("quizId", quiz.getQuizId());
        payload.put("score", saved.getScore());
        payload.put("total", saved.getTotal());
        payload.put("details", details);
        return ResponseEntity.ok(payload);
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }

    private Integer parseIntAnswer(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    
}
