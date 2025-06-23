package com.example.letsplay.controller;

import com.example.letsplay.dto.AuthRequest;
import com.example.letsplay.dto.UserCreateDTO;
import com.example.letsplay.dto.UserDTO;
import com.example.letsplay.model.User;
import com.example.letsplay.security.JwtService;
import com.example.letsplay.security.UserDetailsImpl;
import com.example.letsplay.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// Contrôleur pour l’authentification
// Cette classe gère les requêtes d'authentification et d'inscription des utilisateurs
// Elle utilise le JwtService pour générer des tokens JWT
// Elle utilise le UserRepository pour interagir avec la base de données
// Elle utilise le PasswordEncoder pour encoder les mots de passe
// Elle est annotée avec @RestController pour être détectée par Spring et injectée dans d'autres classes
// Elle est annotée avec @RequestMapping pour définir le chemin de base des requêtes
// Elle est annotée avec @RequiredArgsConstructor pour générer un constructeur avec les dépendances
// Elle utilise Lombok pour générer le constructeur et les méthodes d'accès


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    
    @Autowired
    private JwtService jwtService;
    @Autowired
    private UserService userService;
    
    // AuthenticationManager is used to authenticate the user credentials
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody UserCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        
        // Check if the user exists        
        User user = userService.getUserByEmail(request.getEmail());
        

        // Authenticate the user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));


        // Generate JWT token
        String token = jwtService.generateToken(new UserDetailsImpl(user));
        return ResponseEntity.ok(Map.of("token", token));
    }
}

