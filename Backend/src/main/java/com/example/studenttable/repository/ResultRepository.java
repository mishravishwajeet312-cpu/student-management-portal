package com.example.studenttable.repository;

import com.example.studenttable.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Integer> {

    List<Result> findByStudentId(Long studentId);

    List<Result> findTop10ByOrderByScoreDescTotalDescDateTakenDesc();

}
