package com.example.buy01.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.letsplay.exception.ResourceNotFoundException;
import com.example.letsplay.model.Product;
import com.example.letsplay.repository.ProductRepository;

//// Classe de sécurité pour les produits
/// Cette classe est responsable de la vérification des droits d'accès aux produits
@Component("productSecurity")
public class ProductSecurity {

    @Autowired
    private ProductRepository productRepository;

    public boolean isOwner(String productId, String userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->  new ResourceNotFoundException("Product not found"));

        return product.getUserId().equals(userId);
    }
}

