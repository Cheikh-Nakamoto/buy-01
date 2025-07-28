package com.example.buy01.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.user.dto.UserCreateDTO;
import com.example.buy01.user.dto.UserDTO;
import com.example.buy01.user.dto.UserUpdateDTO;
import com.example.buy01.user.event.KafkaUserProducer;
import com.example.buy01.user.exception.*;
import com.example.buy01.user.model.User;
import com.example.buy01.user.model.UserRoleType.UserRole;
import com.example.buy01.user.repository.UserRepository;
import com.example.buy01.user.utils.ValidateMethods;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private ValidateMethods validateMethods;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private KafkaUserProducer kafkaProducer;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Conversion User → DTO
    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAvatar(user.getAvatar());
        return dto;
    }

    // Création d'un utilisateur
    // Vérification de l'unicité de l'email
    public UserDTO createUser(UserCreateDTO dto, MultipartFile avatar) throws IOException {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new EmailAlreadyUsedException("Email already used");
        }

        // Vérification de la force du mot de passe
        if (dto.getPassword().length() < 8) {
            throw new PasswordTooWeakException("Password must be at least 8 characters long");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        ValidateMethods.validateUser(user);
        
        // Gestion de l'avatar
        // Si l'avatar est fourni, on l'upload
        // Si l'avatar n'est pas fourni, on le met à null
        if (avatar != null && user.getRole() == UserRole.SELLER) {
            user = uploadAvatar(avatar, user);
        } else {
            // Enregistrement de l'utilisateur
            user = userRepository.save(user);
        }

        // Envoi de l'événement de création à Kafka
        //kafkaProducer.sendUserCreatedEvent(user);
        return toDTO(user);
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
        //kafkaProducer.sendUserDeletedEvent(id); // Envoi de l'événement de suppression à Kafka
    }

    public User uploadAvatar(MultipartFile file, User user) throws IOException {
        if (file.isEmpty() || !validateMethods.isImage(file)) {
            throw new IllegalArgumentException("Fichier invalide. Format autorisé : JPEG, PNG, WEBP.");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Taille maximale autorisée : 2 Mo.");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Nom de fichier invalide.");
        }

        // Génération d'un nom de fichier unique
        // Utilisation de UUID pour éviter les collisions de noms
        // Extraction de l'extension du fichier
        String ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID() + ext;

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        // Créer le chemin absolu
        File dest = new File(dir, filename);
        file.transferTo(dest);

        // Mettre à jour l'avatar de l'utilisateur
        if (user.getAvatar() != null) {
            // Supprimer l'ancien avatar si nécessaire
            File oldAvatar = new File(uploadDir + user.getAvatar());
            if (oldAvatar.exists()) {
                oldAvatar.delete();
            }
        }
        
        user.setAvatar("/avatars/" + filename);

        // Enregistrer l'utilisateur avec le nouvel avatar
        user = userRepository.save(user);
        return user;
    }

}