package com.example.buy01.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import io.swagger.v3.oas.annotations.media.Schema;

// DTO pour la requête d'authentification
// Cette classe contient les informations nécessaires pour authentifier un utilisateur
// Elle est utilisée pour recevoir les données de la requête d'authentification
// Elle est annotée avec @Data pour générer automatiquement les méthodes d'accès et de modification
// Elle contient deux champs : email et password
// Elle est utilisée dans le contrôleur AuthController pour traiter les requêtes d'authentification
// Elle est utilisée pour valider les données d'entrée de l'utilisateur
// Elle est utilisée pour mapper les données de la requête JSON à un objet Java
// Elle est utilisée pour sérialiser et désérialiser les données d'entrée de l'utilisateur
// Elle est utilisée pour faciliter la communication entre le client et le serveur
// Elle est utilisée pour encapsuler les données de la requête d'authentification

@Data
public class AuthRequest {
    @Email
    @NotBlank(message = "Email is required")
    @Size(max = 255)
    @Schema(description = "User email", example = "papi@mail.to")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64)
    @Schema(description = "User password", example = "password123")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // Ne pas exposer le mot de passe dans les réponses JSON
    private String password;
}
