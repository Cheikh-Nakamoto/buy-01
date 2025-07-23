package com.example.buy01.user.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.user.dto.UserDTO;
import com.example.buy01.user.dto.UserUpdateDTO;
import com.example.buy01.user.exception.ResourceNotFoundException;
import com.example.buy01.user.model.User;
import com.example.buy01.user.repository.UserRepository;
import com.example.buy01.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;

@Tag(name = "User Controller", description = "Gestion des opérations utilisateurs")
@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('CLIENT', 'SELLER', 'ADMIN')") // Autorise l'accès aux utilisateurs ayant les rôles CLIENT,
                                                         // ADMIN ou SELLER
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Operation(summary = "Obtenir le profil utilisateur courant (Accessible par CLIENT, SELLER ou ADMIN)")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@RequestHeader("X-USER-EMAIL") String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("Utilisateur non trouvé avec l'email : " + email);
        }
        return ResponseEntity.ok(userService.toDTO(user));
    }

    // Récupérer un utilisateur par son ID
    @Operation(summary = "Obtenir un utilisateur par son ID (Accessible par ADMIN ou l'utilisateur lui-même)")
    @GetMapping("/profile/{id}")
    @PostAuthorize("hasRole('ADMIN')") // Autorise l'accès
                                       // si l'utilisateur
                                       // est
                                       // l'utilisateur
                                       // demandé ou s'il
                                       // a le rôle ADMIN
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Modifier un utilisateur
    @Operation(summary = "Modifier un utilisateur (Accessible par ADMIN ou l'utilisateur lui-même)")
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id") // Autorise l'accès si l'utilisateur est
                                                                            // l'utilisateur demandé ou s'il a le rôle
                                                                            // ADMIN
    public ResponseEntity<UserDTO> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @Operation(summary = "Mettre à jour l'avatar de l'utilisateur", description = "Accessible uniquement par les utilisateurs avec les rôles ADMIN ou SELLER. "
            + "Le fichier doit être une image envoyée via multipart/form-data.", requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Fichier avatar (image)", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)))
    @PutMapping(value = "/update/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-USER-EMAIL") String email) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Le fichier ne doit pas être vide");
            }

            if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("Le fichier doit être une image");
            }

            User user = userRepository.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé");
            }

            User updatedUser = userService.uploadAvatar(file, user);
            return ResponseEntity.ok(Map.of("avatarUrl", updatedUser.getAvatar()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de l’upload de l’avatar : " + e.getMessage());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("Utilisateur non trouvé avec l'email : " + email);
        }

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/name/{userId}")
    public ResponseEntity<String> getSellerNameById(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'ID : " + userId));
        return ResponseEntity.ok(user.getName());
    }

}