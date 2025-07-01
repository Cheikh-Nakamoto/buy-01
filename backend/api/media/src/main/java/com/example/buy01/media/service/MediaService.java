package com.example.media.service;

import com.example.media.model.Media;
import com.example.media.utils.FileValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private static final String UPLOAD_DIR = "uploads";

    public Media store(MultipartFile file, String productId) throws IOException {
        if (!FileValidator.isValidImage(file)) {
            throw new IllegalArgumentException("Le fichier doit être une image (JPEG/PNG/WEBP) et ≤ 2 Mo.");
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File dest = new File(UPLOAD_DIR, filename);
        dest.getParentFile().mkdirs();
        file.transferTo(dest);

        Media media = new Media();
        media.setImagePath(filename);
        media.setProductId(productId);

        mediaRepository.save(media); // <- Sauvegarde en base MongoDB

        return media;
    }

    public Media getMedia(String id) {
        // Logique pour récupérer un média par son ID
        // Pour l'instant, on retourne un objet Media vide
        Media media = new Media();
        media.setId(id);
        return media;
    }
}
