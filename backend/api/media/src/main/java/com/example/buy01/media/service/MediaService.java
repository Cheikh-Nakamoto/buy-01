package com.example.buy01.media.service;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.media.exception.ResourceNotFoundException;
import com.example.buy01.media.model.Media;
import com.example.buy01.media.repository.MediaRepository;
import com.example.buy01.media.utils.FileValidator;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

    @Value("${internal.token}")
    private String internalToken;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private ProductClient productClient;

    public Media store(MultipartFile file, String productId, String token, String email, String role)
            throws IOException {

        if (!whichMake(productId, token, email, role)) {
            throw new AccessDeniedException("Access denied for this operation.");
        }

        // get medias by productId
        List<Media> existingMedia = mediaRepository.findByProductId(productId);

        if (existingMedia.size() >= 5) {
            throw new IllegalArgumentException("Un produit ne peut pas avoir plus de 5 images.");
        }

        String filename = uploadAndgenerateFileName(file);

        Media media = new Media();

        media.setImagePath("/productsImages/" + filename);
        media.setProductId(productId);

        mediaRepository.save(media); // <- Sauvegarde en base MongoDB

        return media;
    }

    public List<Media> getMediaByProductId(String productId, String token) {

        List<Media> mediaList = mediaRepository.findByProductId(productId);
        if (mediaList.isEmpty()) {
            mediaList = null; // Retourne null si aucun média trouvé
        }

        return mediaList;
    }

    public void deleteMedia(String mediaId, String internalToken, String email, String role) {

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + mediaId));

        if (!whichMake(media.getProductId(), internalToken, email, role)) {
            throw new AccessDeniedException("Access denied for this operation.");
        }

        File file = new File(UPLOAD_DIR + media.getImagePath());
        if (file.exists()) {
            file.delete();
        }

        mediaRepository.delete(media);
    }

    public Media updateMedia(String mediaId, MultipartFile file, String internalToken, String email,
            String role) {

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + mediaId));

        if (!whichMake(media.getProductId(), internalToken, email, role)) {
            throw new AccessDeniedException("Access denied for this operation.");
        }

        try {
            String filename = uploadAndgenerateFileName(file);

            File oldFile = new File(UPLOAD_DIR + media.getImagePath());
            if (oldFile.exists()) {
                oldFile.delete();
            }

            media.setImagePath("/productsImages/" + filename);
            mediaRepository.save(media);

            return media;

        } catch (IOException e) {
            throw new IllegalStateException("Error uploading file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid file: " + e.getMessage());
        }
    }

    public boolean validateProduct(String productId, String email) {

        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null or empty.");
        }

        if (email == null) {
            throw new IllegalArgumentException("Email cannot be null or empty.");
        }

        return productClient.validateProduct(productId, email);
    }

    public boolean whichMake(String productId, String token, String email, String role) {
        if (email != null && role != null && token == "") {
            if (role.equals("ROLE_SELLER")) {
                System.out.println("Role is SELLER, checking product ownership.");
                if (!validateProduct(productId, email)) {
                    System.out.println("Product does not belong to user: " + email);
                    return false;
                }
            }
        }

        return true;
    }

    public String uploadAndgenerateFileName(MultipartFile file) throws IllegalStateException, IOException {

        if (!FileValidator.isValidImage(file)) {
            throw new IllegalArgumentException("Le fichier doit être une image (JPEG/PNG/WEBP) et ≤ 2 Mo.");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Nom de fichier invalide.");
        }

        String ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID() + ext;

        File dir = new File(UPLOAD_DIR);
        if (!dir.exists())
            dir.mkdirs();

        // Créer le chemin absolu
        File dest = new File(dir, filename);
        file.transferTo(dest);

        return filename;
    }

    public void deleteMediaByProductId(String productId, String token) {

        List<Media> mediaList = mediaRepository.findByProductId(productId);
        if (!mediaList.isEmpty()) {
            for (Media media : mediaList) {
                File file = new File(UPLOAD_DIR + media.getImagePath());
                if (file.exists()) {
                    file.delete();
                }
                mediaRepository.delete(media);
            }
        }
    }

}
