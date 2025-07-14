package com.example.buy01.product.controller;

import jakarta.annotation.security.PermitAll;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    @PermitAll
    public List<ProductDTO> getAll() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    @PermitAll
    public ProductDTO getById(@PathVariable String id) {
        return productService.getProductById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ProductDTO create(@Validated @RequestBody ProductCreateDTO product, @AuthenticationPrincipal UserDetails userDetails) {
        return productService.createProduct(product, userDetails);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @productSecurity.isOwner(#id, authentication.principal.id)") // Autorisation pour les admins ou le propriétaire du produit
    public ProductDTO update(@PathVariable String id, @Validated @RequestBody ProductUpdateDTO product) {
        return productService.updateProduct(id, product);
    }
}
