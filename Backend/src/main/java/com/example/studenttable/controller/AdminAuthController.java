package com.example.studenttable.controller;

import com.example.studenttable.dto.AdminAuthResponse;
import com.example.studenttable.dto.AdminLoginRequest;
import com.example.studenttable.entity.Admin;
import com.example.studenttable.repository.AdminRepository;
import com.example.studenttable.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminAuthController(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Password is required"));
        }

        Optional<Admin> adminOpt = adminRepository.findByEmail(request.getEmail());
        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid credentials"));
        }

        Admin admin = adminOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid credentials"));
        }

        AdminAuthResponse response = new AdminAuthResponse(
                jwtUtil.generateToken(admin.getEmail(), "ADMIN"),
                admin.getEmail(),
                "ADMIN"
        );
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }
}
