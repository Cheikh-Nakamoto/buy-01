package com.example.buy01.media.service;

import lombok.RequiredArgsConstructor;

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
    private String uploadDir;

    @Value("${internal.token}")
    private String internalToken;

    private final MediaRepository mediaRepository;
    private final ProductClient productClient;

    // == CREATE ==
    public Media store(MultipartFile file, String productId, String token, String email, String role) throws IOException {
        authorizeUser(productId, token, email, role);

        if (mediaRepository.findByProductId(productId).size() >= 5) {
            throw new IllegalArgumentException("Un produit ne peut pas avoir plus de 5 images.");
        }

        String filename = uploadAndGenerateFileName(file);
        Media media = new Media("/productsImages/" + filename, productId);
        return mediaRepository.save(media);
    }

    // == READ ==
    public List<Media> getMediaByProductId(String productId, String token) {
        List<Media> mediaList = mediaRepository.findByProductId(productId);
        return mediaList.isEmpty() ? null : mediaList;
    }

    // == UPDATE ==
    public Media updateMedia(String mediaId, MultipartFile file, String token, String email, String role) {
        Media media = getMediaById(mediaId);
        authorizeUser(media.getProductId(), token, email, role);

        try {
            deletePhysicalFile(media.getImagePath());
            String filename = uploadAndGenerateFileName(file);
            media.setImagePath("/productsImages/" + filename);
            return mediaRepository.save(media);

        } catch (IOException e) {
            throw new IllegalStateException("Erreur lors de l’upload du fichier : " + e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Fichier invalide : " + e.getMessage());
        }
    }

    // == DELETE ==
    public void deleteMedia(String mediaId, String token, String email, String role) {
        Media media = getMediaById(mediaId);
        authorizeUser(media.getProductId(), token, email, role);
        deletePhysicalFile(media.getImagePath());
        mediaRepository.delete(media);
    }

    public void deleteMediaByProductId(String productId, String token) {
        List<Media> mediaList = mediaRepository.findByProductId(productId);
        for (Media media : mediaList) {
            deletePhysicalFile(media.getImagePath());
            mediaRepository.delete(media);
        }
    }

    // == HELPERS ==

    private Media getMediaById(String mediaId) {
        return mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + mediaId));
    }

    private void authorizeUser(String productId, String token, String email, String role) {
        if (email != null && role != null && (token == null || token.isEmpty())) {
            if ("ROLE_SELLER".equals(role) && !validateProduct(productId, email)) {
                throw new AccessDeniedException("Accès refusé : le produit ne vous appartient pas.");
            }
        }
    }

    private boolean validateProduct(String productId, String email) {
        if (productId == null || email == null) {
            throw new IllegalArgumentException("L’ID produit et l’email ne peuvent pas être nuls.");
        }
        return productClient.validateProduct(productId, email);
    }

    private String uploadAndGenerateFileName(MultipartFile file) throws IOException {
        if (!FileValidator.isValidImage(file)) {
            throw new IllegalArgumentException("Le fichier doit être une image (JPEG/PNG/WEBP) et ≤ 2 Mo.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Nom de fichier invalide.");
        }

        String ext = originalFilename.substring(originalFilename.lastIndexOf('.'));
        String filename = UUID.randomUUID() + ext;

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        File dest = new File(dir, filename);
        file.transferTo(dest);

        return filename;
    }

    private void deletePhysicalFile(String relativePath) {
        File file = new File(uploadDir + relativePath);
        if (file.exists()) {
            file.delete();
        }
    }
}
