package com.example.studenttable.service;

import com.example.studenttable.dto.AttendanceReportDTO;
import com.example.studenttable.entity.Attendance;
import com.example.studenttable.entity.Student;
import com.example.studenttable.repository.AttendanceRepository;
import com.example.studenttable.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    public Attendance markAttendance(Long studentId, String status) {
        if (studentId == null || studentId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is invalid");
        }
        String normalized = normalizeStatus(status);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        LocalDate today = LocalDate.now();
        Attendance record = attendanceRepository.findByStudentIdAndDate(studentId, today)
                .orElseGet(Attendance::new);

        record.setStudent(student);
        record.setDate(today);
        record.setStatus(normalized);

        return attendanceRepository.save(record);
    }

    public List<Attendance> getAll() {
        return sortByLatest(attendanceRepository.findAll());
    }

    public List<Attendance> getByDate(LocalDate date) {
        if (date == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "date is required");
        }
        return sortByLatest(attendanceRepository.findByDate(date));
    }

    public List<Attendance> getByStudent(Long studentId) {
        if (studentId == null || studentId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "studentId is invalid");
        }
        return attendanceRepository.findByStudentIdOrderByDateDesc(studentId);
    }

    public List<AttendanceReportDTO> getAttendanceReport() {
        return attendanceRepository.getAttendanceReport().stream()
                .map(row -> {
                    Long studentId = (Long) row[0];
                    String studentName = (String) row[1];
                    Long totalDays = (Long) row[2];
                    Long presentDays = row[3] != null ? ((Number) row[3]).longValue() : 0L;
                    double percentage = totalDays > 0
                            ? (presentDays * 100.0) / totalDays
                            : 0.0;
                    return new AttendanceReportDTO(
                            studentId,
                            studentName,
                            totalDays,
                            presentDays,
                            Math.round(percentage * 10.0) / 10.0
                    );
                })
                .collect(Collectors.toList());
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        String trimmed = status.trim().toLowerCase();
        if ("present".equals(trimmed)) {
            return "Present";
        }
        if ("absent".equals(trimmed)) {
            return "Absent";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be Present or Absent");
    }

    private List<Attendance> sortByLatest(List<Attendance> records) {
        records.sort(Comparator
                .comparing(Attendance::getDate, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(Attendance::getId, Comparator.nullsLast(Comparator.reverseOrder()))
        );
        return records;
    }
}
