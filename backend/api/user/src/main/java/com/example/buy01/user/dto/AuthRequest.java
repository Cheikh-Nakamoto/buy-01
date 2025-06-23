package com.example.letsplay.dto;

import lombok.Data;

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
    private String email;
    private String password;
}
