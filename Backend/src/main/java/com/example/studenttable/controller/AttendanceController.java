package com.example.studenttable.controller;

import com.example.studenttable.dto.AttendanceReportDTO;
import com.example.studenttable.dto.AttendanceRequest;
import com.example.studenttable.dto.AttendanceResponse;
import com.example.studenttable.entity.Attendance;
import com.example.studenttable.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    public ResponseEntity<AttendanceResponse> markAttendance(@RequestBody AttendanceRequest request) {
        Attendance saved = attendanceService.markAttendance(request.getStudentId(), request.getStatus());
        return ResponseEntity.ok(toResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> getAll() {
        return ResponseEntity.ok(attendanceService.getAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceResponse>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(attendanceService.getByDate(date).stream().map(this::toResponse).toList());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<AttendanceResponse>> getByStudent(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getByStudent(id).stream().map(this::toResponse).toList());
    }

    @GetMapping("/report")
    public ResponseEntity<List<AttendanceReportDTO>> getAttendanceReport() {
        return ResponseEntity.ok(attendanceService.getAttendanceReport());
    }

    private AttendanceResponse toResponse(Attendance attendance) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getStudent() != null ? attendance.getStudent().getId() : null,
                attendance.getStudent() != null ? attendance.getStudent().getName() : null,
                attendance.getDate(),
                attendance.getStatus()
        );
    }
}
