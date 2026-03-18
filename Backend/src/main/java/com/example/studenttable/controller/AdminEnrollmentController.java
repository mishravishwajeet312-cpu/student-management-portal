package com.example.studenttable.controller;

import com.example.studenttable.dto.EnrollRequest;
import com.example.studenttable.entity.Enrollment;
import com.example.studenttable.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminEnrollmentController {

    private final EnrollmentService enrollmentService;

    public AdminEnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> enrollStudent(@RequestBody EnrollRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(request));
    }
}
