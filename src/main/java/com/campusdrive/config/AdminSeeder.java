package com.campusdrive.config;

import com.campusdrive.entity.Role;
import com.campusdrive.entity.User;
import com.campusdrive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Crea el primer administrador en la base de datos si no existe.
 * Operación idempotente: verifica existencia antes de insertar.
 */
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name}")
    private String adminName;

    @Override
    public void run(String... args) {
        // Verificación idempotente: solo crear si no existe
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            logger.info("Admin user created successfully: {}", adminEmail);
        } else {
            logger.info("Admin user already exists: {}", adminEmail);
        }
    }
}
