package com.example.buy01.user.controller;
// Contrôleur pour les opérations administratives

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.buy01.user.dto.UserDTO;
import com.example.buy01.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

// Cette classe gère les requêtes d'administration des utilisateurs
// Elle utilise le UserService pour interagir avec la base de données
// Elle est annotée avec @RestController pour être détectée par Spring et injectée dans d'autres classes
// Elle est annotée avec @RequestMapping pour définir le chemin de base des requêtes
// Elle est annotée avec @PreAuthorize pour restreindre l'accès aux utilisateurs ayant le rôle ADMIN
// Elle utilise Lombok pour générer le constructeur et les méthodes d'accès

@Tag(name = "Administration", description = "Actions réservées à l’ADMIN")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private UserService userService;
    //@Autowired
    //private ProductService productService;
    /*
     * 
     * 
     * public AdminController(UserService userService, ProductService
     * productService) {
     * this.productService = productService;
     * this.userService = userService;
     * }
     */

    // Liste de tous les utilisateurs
    @Operation(summary = "Lister tous les utilisateurs")
    @GetMapping("/users/all")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // Supprimer un utilisateur
    @Operation(summary = "Supprimer un utilisateur")
    @DeleteMapping("/users/del/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Supprimmer un produit
    /*@DeleteMapping("/products/{id}")
    public void delete(@PathVariable String id) {
        productService.deleteProduct(id);
    }*/
}
