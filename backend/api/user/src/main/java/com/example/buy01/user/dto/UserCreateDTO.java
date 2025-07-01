package com.example.buy01.user.dto;

import org.springframework.data.mongodb.core.index.Indexed;

import com.example.buy01.user.model.UserRoleType.UserRole;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserCreateDTO {

    // DTO pour la création d'un utilisateur
    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    @Size(min = 5, max = 50, message = "L'email doit contenir entre 5 et 50 caractères")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    private String password;

    @NotNull(message = "Le rôle est obligatoire")
    @Pattern(regexp = "CLIENT|SELLER", message = "Le rôle doit être CLIENT ou SELLER")
    private UserRole role;

    // Getters and Setters
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }
    public void setRole(UserRole role) {
        this.role = role;
    }
    
}