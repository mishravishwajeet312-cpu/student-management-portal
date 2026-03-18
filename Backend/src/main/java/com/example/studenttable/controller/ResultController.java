package com.example.studenttable.controller;

import com.example.studenttable.entity.Result;
import com.example.studenttable.repository.ResultRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ResultController {

    private final ResultRepository resultRepository;

    public ResultController(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    @GetMapping("/results/{studentId}")
    public ResponseEntity<?> getResultsByStudent(@PathVariable Long studentId) {
        if (studentId == null || studentId <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("studentId is invalid"));
        }
        List<Result> results = resultRepository.findByStudentId(studentId);
        return ResponseEntity.ok(mapResults(results));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        List<Result> topResults = resultRepository.findTop10ByOrderByScoreDescTotalDescDateTakenDesc();
        return ResponseEntity.ok(mapResults(topResults));
    }

    private List<Map<String, Object>> mapResults(List<Result> results) {
        return results.stream()
                .map(result -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("resultId", result.getResultId());
                    item.put("studentId", result.getStudent() != null ? result.getStudent().getId() : null);
                    item.put("quizId", result.getQuiz() != null ? result.getQuiz().getQuizId() : null);
                    item.put("score", result.getScore());
                    item.put("total", result.getTotal());
                    item.put("dateTaken", result.getDateTaken());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }
}
