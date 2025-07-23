package com.example.buy01.product.controller;

import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Operation(summary = "Récupérer tous les produits")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des produits récupérée avec succès")
    })
    @GetMapping("/all")
    @PermitAll
    public List<ProductDTO> getAll() {
        return productService.getAllProducts();
    }

    @Operation(summary = "Récupérer un produit par son ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Produit trouvé"),
            @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    })
    @GetMapping("/{id}")
    @PermitAll
    public ProductDTO getById(@PathVariable String id) {
        return productService.getProductById(id);
    }

    @Operation(
        summary = "Créer un nouveau produit avec images",
        description = "Cette méthode permet aux vendeurs ou aux admins de créer un produit avec 0 à 3 images (2 Mo max chacun)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Produit créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Requête invalide"),
            @ApiResponse(responseCode = "403", description = "Accès refusé"),
    })
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public ProductDTO create(
            @Parameter(description = "Données du produit (JSON)", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
            @Validated @RequestPart("data") ProductCreateDTO product,

            @Parameter(description = "Email de l'utilisateur") @RequestHeader("X-USER-EMAIL") String email,
            @Parameter(description = "Rôle de l'utilisateur") @RequestHeader("X-USER-ROLE") String role,

            @Parameter(description = "Jusqu’à 3 images (max 2 Mo chacune)")
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        return productService.createProduct(product, email, role, files);
    }

    @Operation(summary = "Mettre à jour un produit")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Produit mis à jour"),
            @ApiResponse(responseCode = "403", description = "Non autorisé à modifier ce produit"),
            @ApiResponse(responseCode = "404", description = "Produit non trouvé")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO update(
            @PathVariable String id,
            @Validated @RequestBody ProductUpdateDTO product) {
        return productService.updateProduct(id, product);
    }
}
