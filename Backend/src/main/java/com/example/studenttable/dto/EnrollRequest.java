package com.example.studenttable.dto;

import lombok.Data;

@Data
public class EnrollRequest {
    private Long studentId;
    private Long courseId;
}
