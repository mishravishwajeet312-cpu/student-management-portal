package com.example.studenttable.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminAuthResponse {

    private String token;
    private String email;
    private String role;
}
