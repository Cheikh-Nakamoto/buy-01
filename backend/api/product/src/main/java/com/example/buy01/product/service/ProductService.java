package com.example.buy01.product.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.exception.ResourceNotFoundException;
import com.example.buy01.product.model.Product;
import com.example.buy01.product.repository.ProductRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    @Autowired
    private ValidateMethods validateMethods;

    @Autowired
    private ProductRepository productRepository;

    public ProductDTO createProduct(ProductCreateDTO product, UserDetails userDetails) {
        //String id = userDetails.getId(); // ID de l'utilisateur connecté.
        boolean hasRole = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));

        Product newProduct = new Product();
        newProduct.setName(product.getName());
        newProduct.setDescription(product.getDescription());
        newProduct.setPrice(product.getPrice());
        newProduct.setUserId(product.getUserId());
        
        if (hasRole) {
            //newProduct.setUserId(id); // Assigner l'ID de l'utilisateur connecté au produit
        }
        
        if (newProduct.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        ValidateMethods.validateProduct(newProduct);
        return toDTO(productRepository.save(newProduct));
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(String id) {
        validateMethods.validateObjectId(id);
        return productRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public ProductDTO updateProduct(String id, ProductUpdateDTO updatedProduct) {
        validateMethods.validateObjectId(id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (updatedProduct.getName() != null && !updatedProduct.getName().isBlank()) {
            product.setName(updatedProduct.getName());
        }

        if (updatedProduct.getDescription() != null && !updatedProduct.getDescription().isBlank()) {
            product.setDescription(updatedProduct.getDescription());
        }

        if (updatedProduct.getPrice() != null) {
            product.setPrice(updatedProduct.getPrice());
        }

        ValidateMethods.validateProduct(product);
        return toDTO(productRepository.save(product));
    }

    public void deleteProduct(String id) {
        validateMethods.validateObjectId(id);
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    // 🔒 Masque les données sensibles
    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setUserId(product.getUserId());
        return dto;
    }

}
