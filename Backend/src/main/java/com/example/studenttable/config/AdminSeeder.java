package com.example.studenttable.config;

import com.example.studenttable.entity.Admin;
import com.example.studenttable.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${admin.seed.email:admin@example.com}")
    private String seedEmail;

    @Value("${admin.seed.password:admin123}")
    private String seedPassword;

    public AdminSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        Optional<Admin> existing = adminRepository.findByEmail(seedEmail);
        if (existing.isPresent()) {
            return;
        }
        String hashedPassword = passwordEncoder.encode(seedPassword);
        Admin admin = new Admin();
        admin.setEmail(seedEmail);
        admin.setPassword(hashedPassword);
        adminRepository.save(admin);
        logger.info("Seeded admin user '{}'.", seedEmail);
        logger.info("Admin seed SQL: INSERT INTO admins (email, password) VALUES ('{}', '{}');", seedEmail, hashedPassword);
    }
}
