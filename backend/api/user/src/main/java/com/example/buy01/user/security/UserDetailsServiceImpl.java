package com.example.letsplay.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.example.letsplay.repository.UserRepository;

import lombok.RequiredArgsConstructor;

//Charger les users depuis MongoDB
// Cette classe implémente UserDetailsService pour charger les utilisateurs depuis la base de données
// Elle utilise le UserRepository pour interagir avec la base de données
// Elle est annotée avec @Service pour être détectée par Spring et injectée dans d'autres classes
// Elle utilise Lombok pour générer le constructeur et les méthodes d'accès
// Elle utilise le modèle UserDetailsImpl pour adapter le modèle User à Spring Security
// Elle gère les exceptions liées à l'utilisateur non trouvé
// Elle est responsable de la conversion du modèle User en UserDetails pour Spring Security
// Elle est utilisée par le filtre JwtAuthenticationFilter pour authentifier les utilisateurs
// Elle est configurée dans la classe SecurityConfig pour être utilisée par Spring Security

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws RuntimeException {
        var user = userRepository.findByEmail(email);
        if (user == null) {
            return null; // ou vous pouvez lancer une exception personnalisée
        }
        return new UserDetailsImpl(user);
    }
}