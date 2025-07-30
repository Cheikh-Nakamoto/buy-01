package com.example.buy01.product.controller;

import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.exception.ResourceNotFoundException;
import com.example.buy01.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

        private final ProductService productService;

        @Value("${internal.token}")
        private String internalToken;

        public ProductController(ProductService productService) {
                this.productService = productService;
        }

        @Operation(summary = "Récupérer tous les produits")
        @ApiResponse(responseCode = "200", description = "Liste des produits récupérée avec succès")
        @GetMapping("/all")
        @PermitAll
        public List<ProductDTO> getAll() {
                return productService.getAllProducts();
        }

        @Operation(summary = "Récupérer un produit par son ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Produit trouvé"),
                        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
        })
        @GetMapping("/{id}")
        @PermitAll
        public ProductDTO getById(@PathVariable String id) {
                return productService.getProductById(id);
        }

        @Operation(summary = "Créer un produit avec images")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Produit créé"),
                        @ApiResponse(responseCode = "400", description = "Requête invalide"),
                        @ApiResponse(responseCode = "403", description = "Accès refusé")
        })
        @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
        public ProductDTO create(
                        @Validated @RequestPart("data") ProductCreateDTO product,
                        @RequestHeader("X-USER-EMAIL") String email,
                        @RequestHeader("X-USER-ROLE") String role,
                        @RequestPart(value = "files", required = false) MultipartFile[] files) {
                return productService.createProduct(product, email, role, files);
        }

        @Operation(summary = "Mettre à jour un produit")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Produit mis à jour"),
                        @ApiResponse(responseCode = "403", description = "Non autorisé"),
                        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
        })
        @PutMapping("/update/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
        public ProductDTO update(
                        @PathVariable String id,
                        @Validated @RequestBody ProductUpdateDTO product,
                        @RequestHeader("X-USER-EMAIL") String email,
                        @RequestHeader("X-USER-ROLE") String role) {
                return productService.updateProduct(id, product, email, role);
        }

        @Operation(summary = "Supprimer un produit")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Produit supprimé"),
                        @ApiResponse(responseCode = "403", description = "Non autorisé"),
                        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
        })
        @DeleteMapping("/delete/{id}")
        @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
        public void delete(
                        @PathVariable String id,
                        @RequestHeader("X-USER-EMAIL") String email,
                        @RequestHeader("X-USER-ROLE") String role) {
                productService.deleteProduct(id, email, role);
        }

        @Operation(summary = "Récupérer les produits d'un utilisateur")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Produits récupérés"),
                        @ApiResponse(responseCode = "404", description = "Aucun produit trouvé")
        })
        @GetMapping("/myproducts")
        @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
        public List<ProductDTO> getUserProducts(
                        @RequestHeader("X-USER-EMAIL") String email,
                        @RequestHeader("X-USER-ROLE") String role) {
                return productService.getProductsByUserId(email, role);
        }

        @Operation(summary = "Valider un produit (interne)")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Produit validé"),
                        @ApiResponse(responseCode = "404", description = "Produit non trouvé")
        })
        @GetMapping("/internal/validate/{productId}")
        public ResponseEntity<?> validateProduct(
                        @PathVariable String productId,
                        @RequestHeader("X-USER-EMAIL") String email,
                        @RequestHeader("X-INTERNAL-TOKEN") String token) {
                boolean isValid = productService.validateProduct(productId, email);
                if (isValid) {
                        return ResponseEntity.ok("Produit validé avec succès");
                } else {
                        throw new ResourceNotFoundException("Produit non trouvé ou invalide");
                }
        }
}
