package com.example.buy01.user.controller;
// Contrôleur pour les opérations administratives
// Cette classe gère les requêtes d'administration des utilisateurs
// Elle utilise le UserService pour interagir avec la base de données
// Elle est annotée avec @RestController pour être détectée par Spring et injectée dans d'autres classes
// Elle est annotée avec @RequestMapping pour définir le chemin de base des requêtes
// Elle est annotée avec @PreAuthorize pour restreindre l'accès aux utilisateurs ayant le rôle ADMIN
// Elle utilise Lombok pour générer le constructeur et les méthodes d'accès

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;
    @Autowired
    private ProductService productService;
    /*
     * 
     * 
     public AdminController(UserService userService, ProductService productService) {
         this.productService = productService;
         this.userService = userService;
     }
     */

    // Liste de tous les utilisateurs
    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // Supprimer un utilisateur
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // Supprimmer un produit
    @DeleteMapping("/products/{id}")
    public void delete(@PathVariable String id) {
        productService.deleteProduct(id);
    }
}
