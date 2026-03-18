package com.example.studenttable.dto;

import lombok.Data;

import java.util.List;

@Data
public class StudentSignupRequest {

    private String name;
    private String email;
    private String password;
    private String role;
    private List<String> enrolledCourses;
}
