package com.example.letsplay.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.letsplay.dto.UserCreateDTO;
import com.example.letsplay.dto.UserDTO;
import com.example.letsplay.dto.UserUpdateDTO;
import com.example.letsplay.exception.*;
import com.example.letsplay.model.User;
import com.example.letsplay.repository.UserRepository;


import java.util.List;

@Service
public class UserService {

    @Autowired
    private ValidateMethods validateMethods;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // Conversion User → DTO
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    // Création d'un utilisateur
    // Vérification de l'unicité de l'email
    public UserDTO createUser(UserCreateDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyUsedException("Email already used");
        }

        // Vérification de la force du mot de passe
        if (dto.getPassword().length() < 6) {
            throw new PasswordTooWeakException("Password must be at least 6 characters long");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());

        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        ValidateMethods.validateUser(user);
        return toDTO(userRepository.save(user));
    }

    // Récupération de tous les utilisateurs
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    // Récupération d'un utilisateur par ID
    // Vérification de l'existence de l'utilisateur
    // Vérification de l'ID
    public UserDTO getUserById(String id) {
        validateMethods.validateObjectId(id);
        return userRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
    }

    // Récupération d'un utilisateur par email
    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        return user;
    }

    // Mise à jour d'un utilisateur
    // Vérification de l'existence de l'utilisateur
    // Vérification de l'ID
    public UserDTO updateUser(String id, UserUpdateDTO dto) {
        validateMethods.validateObjectId(id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }
        
        ValidateMethods.validateUser(user);
        return toDTO(userRepository.save(user));
    }

    // Vérification de l'ID
    // Suppression d'un utilisateur
    public void deleteUser(String id) {
        validateMethods.validateObjectId(id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }
}