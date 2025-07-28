package com.example.buy01.product.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.product.dto.MediaDTO;
import com.example.buy01.product.dto.ProductCreateDTO;
import com.example.buy01.product.dto.ProductDTO;
import com.example.buy01.product.dto.ProductUpdateDTO;
import com.example.buy01.product.dto.UserDTO;
import com.example.buy01.product.exception.ResourceNotFoundException;
import com.example.buy01.product.model.Product;
import com.example.buy01.product.repository.ProductRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    @Autowired
    private UserClient userClient;

    @Autowired
    private MediaClient mediaClient;

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

        
        if (files.length > 3) {
            throw new IllegalArgumentException("Maximum 3 images autorisées");
        }
        
        ValidateMethods.validateProduct(newProduct);
        Product productSave = productRepository.save(newProduct);
        List<MediaDTO> imageProduts = UploadImages(productSave.getId(), files);
        return toDTO(productSave, user.getName(), imageProduts);
    }

    private List<MediaDTO> UploadImages(String productId, MultipartFile[] files) {

        List<MediaDTO> mediaList = new ArrayList<>();

        if (files != null) {
            for (MultipartFile file : files) {
                if (file.getSize() > 2 * 1024 * 1024) {
                    throw new IllegalArgumentException("Chaque image doit faire moins de 2 Mo");
                }

                // Vérifie le type mime si nécessaire
                if (!file.getContentType().startsWith("image/")) {
                    throw new IllegalArgumentException("Le fichier doit être une image");
                }

                MediaDTO media = mediaClient.store(file, productId);

                if (media == null) {
                    mediaList = null; // Retourne null si l'upload échoue
                } else {
                    mediaList.add(media);
                }
            }
        }

        return mediaList;
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
                    List<MediaDTO> imageUrls = mediaClient.getMediasByProductId(product.getId());
                    if (imageUrls == null) {
                        imageUrls = new ArrayList<>(); // Si aucune image n'est trouvée, on initialise une liste vide
                    }

                    return toDTO(product, name, imageUrls);
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
        // Supprime les médias associés au produit
        mediaClient.deleteMediaByProductId(id);

        productRepository.deleteById(id);
    }

    // 🔒 Masque les données sensibles
    private ProductDTO toDTO(Product product, String sellerName, List<MediaDTO> imageUrls) {
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

    public boolean validateProduct(String productId, String email) {

        // Appel à user-service pour vérifier l'utilisateur
        UserDTO user = userClient.getUserByEmail(email);
        System.out.println("User: " + user);
        if (productId == null || productId.isEmpty() || email == null || email.isEmpty() || user == null) {
            return false;
        }

        Optional<Product> product = productRepository.findById(productId);
        System.out.println("Product: " + product);
        if (product.isEmpty()) {
            return false;
        }

        if (!product.get().getUserId().equals(user.getId())) {
            System.out.println("Product does not belong to user: " + user.getId());
            return false;
        }

        return true;
    }
}
