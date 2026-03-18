package com.example.studenttable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private LocalDate date;
    private String status;
}
