package com.example.studenttable.controller;

import com.example.studenttable.entity.Course;
import com.example.studenttable.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentCourseController {

    private final EnrollmentService enrollmentService;

    public StudentCourseController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<List<Course>> getStudentCourses(@PathVariable Long id) {
        return ResponseEntity.ok(enrollmentService.getCoursesForStudent(id));
    }
}
