package com.example.studenttable.service;

import com.example.studenttable.dto.EnrollRequest;
import com.example.studenttable.entity.Course;
import com.example.studenttable.entity.Enrollment;
import com.example.studenttable.entity.Student;
import com.example.studenttable.repository.CourseRepository;
import com.example.studenttable.repository.EnrollmentRepository;
import com.example.studenttable.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public Enrollment enrollStudent(EnrollRequest request) {
        if (request.getStudentId() == null || request.getStudentId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is invalid");
        }
        if (request.getCourseId() == null || request.getCourseId() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "courseId is invalid");
        }

        if (enrollmentRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student is already enrolled in this course");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        return enrollmentRepository.save(enrollment);
    }

    public List<Course> getCoursesForStudent(Long studentId) {
        if (studentId == null || studentId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is invalid");
        }
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }
}
