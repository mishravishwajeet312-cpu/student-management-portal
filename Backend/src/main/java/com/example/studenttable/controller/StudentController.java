package com.example.studenttable.controller;

import com.example.studenttable.dto.AuthResponse;
import com.example.studenttable.dto.StudentLoginRequest;
import com.example.studenttable.dto.StudentSignupRequest;
import com.example.studenttable.entity.Student;
import com.example.studenttable.entity.StudentCourse;
import com.example.studenttable.repository.StudentRepository;
import com.example.studenttable.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public StudentController(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody StudentSignupRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Password must be at least 6 characters"));
        }
        if (studentRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error("Email already exists"));
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole("STUDENT");
        if (request.getEnrolledCourses() != null) {
            request.getEnrolledCourses().stream()
                    .filter(course -> course != null && !course.isBlank())
                    .forEach(course -> student.getEnrolledCourses()
                            .add(new StudentCourse(null, student, course)));
        }

        Student saved = studentRepository.save(student);

        AuthResponse response = new AuthResponse(
                jwtUtil.generateToken(saved.getEmail(), saved.getRole()),
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody StudentLoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Email is required"));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error("Password is required"));
        }

        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid credentials"));
        }

        Student student = studentOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Invalid credentials"));
        }

        AuthResponse response = new AuthResponse(
                jwtUtil.generateToken(student.getEmail(), student.getRole()),
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getRole()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    private Map<String, Object> error(String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("error", message);
        return payload;
    }
}
