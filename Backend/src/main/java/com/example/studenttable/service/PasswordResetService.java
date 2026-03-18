package com.example.studenttable.service;

import com.example.studenttable.dto.ForgotPasswordRequest;
import com.example.studenttable.dto.ResetPasswordRequest;
import com.example.studenttable.dto.VerifyOtpRequest;
import com.example.studenttable.entity.Admin;
import com.example.studenttable.entity.PasswordReset;
import com.example.studenttable.entity.Student;
import com.example.studenttable.repository.AdminRepository;
import com.example.studenttable.repository.PasswordResetRepository;
import com.example.studenttable.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;

    private final PasswordResetRepository passwordResetRepository;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            PasswordResetRepository passwordResetRepository,
            StudentRepository studentRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.passwordResetRepository = passwordResetRepository;
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void sendOtp(ForgotPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String otp = generateOtp();
        PasswordReset reset = new PasswordReset();
        reset.setEmail(request.getEmail().trim());
        reset.setOtp(otp);
        reset.setExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        reset.setUsed(false);
        passwordResetRepository.save(reset);

        emailService.sendOtpEmail(request.getEmail().trim(), otp);
    }

    public void verifyOtp(VerifyOtpRequest request) {
        validateOtp(request.getEmail(), request.getOtp());
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }

        PasswordReset reset = validateOtp(request.getEmail(), request.getOtp());

        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail().trim());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            student.setPassword(passwordEncoder.encode(request.getNewPassword()));
            studentRepository.save(student);
        } else {
            Admin admin = adminRepository.findByEmail(request.getEmail().trim())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
            adminRepository.save(admin);
        }

        reset.setUsed(true);
        passwordResetRepository.save(reset);
    }

    private PasswordReset validateOtp(String email, String otp) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (otp == null || otp.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        return passwordResetRepository.findByEmailAndOtpAndExpiryAfterAndUsedFalse(
                        email.trim(),
                        otp.trim(),
                        LocalDateTime.now()
                )
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is invalid or expired"));
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        int number = secureRandom.nextInt(bound);
        return String.format("%0" + OTP_LENGTH + "d", number);
    }
}
