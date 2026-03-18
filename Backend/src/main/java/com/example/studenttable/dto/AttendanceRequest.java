package com.example.studenttable.dto;

import lombok.Data;

@Data
public class AttendanceRequest {
    private Long studentId;
    private String status;
}
