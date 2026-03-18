package com.example.studenttable.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SubmitQuizRequest {

    private Long studentId;
    private Map<Integer, Integer> answers;
}
