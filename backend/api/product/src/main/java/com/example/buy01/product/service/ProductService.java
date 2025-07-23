package com.example.buy01.product.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.dto.UserDTO;
import com.example.buy01.product.exception.ResourceNotFoundException;
import com.example.buy01.product.model.Product;
import com.example.buy01.product.repository.ProductRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private UserClient userClient;

    @Autowired
    private ValidateMethods validateMethods;

    @Autowired
    private ProductRepository productRepository;

    public ProductDTO createProduct(ProductCreateDTO product, String email, String role, MultipartFile[] files) {

        // Appel à user-service pour vérifier l'utilisateur
        UserDTO user = userClient.getUserByEmail(email);

        Product newProduct = new Product();
        newProduct.setName(product.getName());
        newProduct.setDescription(product.getDescription());
        newProduct.setPrice(product.getPrice());
        newProduct.setQuantity(product.getQuantity());
        newProduct.setUserId(product.getUserId());

        if (role != null && role.equals("ROLE_SELLER")) {
            newProduct.setUserId(user.getId()); // Assigner l'ID de l'utilisateur connecté au produit
        }

        if (newProduct.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        ValidateMethods.validateProduct(newProduct);
        Product productSave = productRepository.save(newProduct);
        List<String> imageProduts = UploadImages(productSave.getId(), files);
        return toDTO(productSave, user.getName(), imageProduts);
    }

    private List<String> UploadImages(String id, MultipartFile[] files) {

        // Sending by RestTemplate to media service
        // A implémenter : Upload des images et récupérer les URLs

        /*
         * if (files != null) {
         * if (files.length > 3) {
         * throw new IllegalArgumentException("Maximum 3 images autorisées");
         * }
         * 
         * for (MultipartFile file : files) {
         * if (file.getSize() > 2 * 1024 * 1024) {
         * throw new IllegalArgumentException("Chaque image doit faire moins de 2 Mo");
         * }
         * 
         * // Vérifie le type mime si nécessaire
         * if (!file.getContentType().startsWith("image/")) {
         * throw new IllegalArgumentException("Le fichier doit être une image");
         * }
         * }
         * }
         */

        return List.of(); // Retourne une liste vide pour l'instant, à remplacer par les URLs des images
    }

    // Récupération de tous les produits
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(product -> {
                    return getProductById(product.getId());
                })
                .collect(Collectors.toList());
    }

    // Récupération d'un produit par ID
    public ProductDTO getProductById(String id) {
        validateMethods.validateObjectId(id);
        return productRepository.findById(id)
                .map(product -> {
                    String name = userClient.getSellerNameById(product.getUserId());
                    // List<String> imageUrls = List.of() // Créer une méthode pour récupérer les
                    // URLs des images
                    return toDTO(product, name, List.of() /* imageUrls */);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public ProductDTO updateProduct(String id, ProductUpdateDTO updatedProduct, String email, String role) {
        validateMethods.validateObjectId(id);

        // Appel à user-service pour vérifier l'utilisateur
        UserDTO userConnected = userClient.getUserByEmail(email);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Vérifie si l'utilisateur connecté est le propriétaire du produit ou un admin
        if (!product.getUserId().equals(userConnected.getId()) && !role.equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à modifier ce produit");
        }

        if (updatedProduct.getName() != null && !updatedProduct.getName().isBlank()) {
            product.setName(updatedProduct.getName());
        }

        if (updatedProduct.getDescription() != null && !updatedProduct.getDescription().isBlank()) {
            product.setDescription(updatedProduct.getDescription());
        }

        if (updatedProduct.getPrice() != null) {
            product.setPrice(updatedProduct.getPrice());
        }

        if (updatedProduct.getQuantity() != null) {
            product.setQuantity(updatedProduct.getQuantity());
        }


        ValidateMethods.validateProduct(product);

        productRepository.save(product);

        return getProductById(product.getId());
    }

    public void deleteProduct(String id, String email, String role) {

        // Appel à user-service pour vérifier l'utilisateur
        UserDTO user = userClient.getUserByEmail(email);

        validateMethods.validateObjectId(id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Vérifie si l'utilisateur connecté est le propriétaire du produit ou un admin
        if (!product.getUserId().equals(user.getId()) && !role.equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à supprimer ce produit");
        }

        // Supprimer les images associées si nécessaire
        // A implémenter : Sending de Kafka event pour que le consumer qui est dans le media supprimer toutes les images liées à ce produit
        productRepository.deleteById(id);
    }

    // 🔒 Masque les données sensibles
    private ProductDTO toDTO(Product product, String sellerName, List<String> imageUrls) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setQuantity(product.getQuantity());
        dto.setSellerName(sellerName);
        dto.setImageUrls(imageUrls);
        return dto;
    }

    public List<ProductDTO> getProductsByUserId(String email, String role) {
        UserDTO user = userClient.getUserByEmail(email);

        String userId = user.getId();

        List<Product> products = productRepository.findByUserId(userId);

        if (products.isEmpty()) {
            throw new ResourceNotFoundException("Aucun produit trouvé pour cet utilisateur");
        }

        return products.stream()
                .map(product -> {
                    String sellerName = userClient.getSellerNameById(product.getUserId());
                    return toDTO(product, sellerName, List.of() /* imageUrls */);
                })
                .collect(Collectors.toList());
    }
}
