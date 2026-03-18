package com.example.studenttable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long studentId;
    private String name;
    private String email;
    private String role;
}
