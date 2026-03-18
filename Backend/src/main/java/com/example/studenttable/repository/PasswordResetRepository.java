package com.example.studenttable.repository;

import com.example.studenttable.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {

    Optional<PasswordReset> findTopByEmailOrderByExpiryDesc(String email);

    Optional<PasswordReset> findByEmailAndOtpAndExpiryAfterAndUsedFalse(
            String email,
            String otp,
            LocalDateTime now
    );
}
