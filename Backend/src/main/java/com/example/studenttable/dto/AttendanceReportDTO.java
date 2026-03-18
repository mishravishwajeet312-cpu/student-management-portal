package com.example.studenttable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AttendanceReportDTO {
    private Long studentId;
    private String studentName;
    private Long totalDays;
    private Long presentDays;
    private Double percentage;
}
