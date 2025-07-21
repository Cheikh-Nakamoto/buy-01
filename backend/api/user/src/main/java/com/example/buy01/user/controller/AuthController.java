package com.example.buy01.user.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.user.dto.AuthRequest;
import com.example.buy01.user.dto.UserCreateDTO;
import com.example.buy01.user.dto.UserDTO;
import com.example.buy01.user.model.User;
import com.example.buy01.user.security.JwtService;
import com.example.buy01.user.security.UserDetailsImpl;
import com.example.buy01.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Contrôleur pour l’authentification
// Cette classe gère les requêtes d'authentification et d'inscription des utilisateurs
// Elle utilise le JwtService pour générer des tokens JWT
// Elle utilise le UserRepository pour interagir avec la base de données
// Elle utilise le PasswordEncoder pour encoder les mots de passe
// Elle est annotée avec @RestController pour être détectée par Spring et injectée dans d'autres classes
// Elle est annotée avec @RequestMapping pour définir le chemin de base des requêtes
// Elle est annotée avec @RequiredArgsConstructor pour générer un constructeur avec les dépendances
// Elle utilise Lombok pour générer le constructeur et les méthodes d'accès

@Tag(name = "Authentication", description = "Inscription et connexion")
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

    @Operation(summary = "Inscription d’un utilisateur")
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> register(
            @RequestPart("data") @Valid UserCreateDTO request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request, avatar));
    }

    @Operation(summary = "Connexion de l’utilisateur")
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
