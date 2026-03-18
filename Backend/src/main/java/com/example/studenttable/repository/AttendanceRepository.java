package com.example.studenttable.repository;

import com.example.studenttable.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByStudentIdOrderByDateDesc(Long studentId);

    @Query("SELECT a.student.id, a.student.name, COUNT(a), " +
            "SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) " +
            "FROM Attendance a GROUP BY a.student.id, a.student.name")
    List<Object[]> getAttendanceReport();
}
