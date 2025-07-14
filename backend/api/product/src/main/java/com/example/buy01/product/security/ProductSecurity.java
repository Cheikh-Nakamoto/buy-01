package com.example.buy01.product.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.example.buy01.product.exception.ResourceNotFoundException;
import com.example.buy01.product.model.Product;
import com.example.buy01.product.repository.ProductRepository;


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

