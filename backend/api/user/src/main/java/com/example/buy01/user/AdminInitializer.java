package com.example.buy01.user;

import com.example.buy01.user.model.User;
import com.example.buy01.user.model.UserRoleType.UserRole;
import com.example.buy01.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;    


@Component
public class AdminInitializer implements CommandLineRunner {


    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@root.com") == null) {
            User admin = new User();
            admin.setName("adminroot");
            admin.setEmail("admin@root.com");
            admin.setPassword(passwordEncoder.encode("test123"));
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("✅ Admin user created");
        }
    }
}
