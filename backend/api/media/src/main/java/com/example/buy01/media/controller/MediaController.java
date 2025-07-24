package com.example.buy01.media.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.media.model.Media;
import com.example.buy01.media.service.MediaService;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @PostMapping(value = "/upload/{productId}", consumes = "multipart/form-data")
    public ResponseEntity<?> upload(
            @PathVariable String productId,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        try {
            if (internalToken == null || email == null || role == null) {
                return ResponseEntity.badRequest().body("Missing required headers.");
            }

            Media media = mediaService.store(file, productId, internalToken, email, role);

            return ResponseEntity.ok(media);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors du téléchargement.");
        }
    }

    @GetMapping("/get/{productId}")
    public ResponseEntity<?> getMediaByProductId(@PathVariable String productId,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken) {
        try {
            List<Media> media = mediaService.getMediaByProductId(productId, internalToken);
            if (media != null) {
                return ResponseEntity.ok(media);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de la récupération des médias.");
        }
    }

    @DeleteMapping("/delete/{mediaId}")
    public ResponseEntity<?> deleteMedia(@PathVariable String mediaId,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        try {
            if (internalToken == null || email == null || role == null) {
                return ResponseEntity.badRequest().body("Missing required headers.");
            }

            mediaService.deleteMedia(mediaId, internalToken, email, role);
            return ResponseEntity.ok("Media deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de la suppression du média.");
        }
    }

    @DeleteMapping("/internal/delete/product/{productId}")
    public ResponseEntity<?> deleteMediaByProductId(@PathVariable String productId,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = true) String internalToken) {
        try {
            mediaService.deleteMediaByProductId(productId, internalToken);
            return ResponseEntity.ok("Medias deleted successfully for product ID: " + productId);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erreur lors de la suppression des médias pour le produit.");
        }
    }

    @PutMapping("/update/{mediaId}")
    public ResponseEntity<?> updateMedia(
            @PathVariable String mediaId,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        try {
            Media updatedMedia = mediaService.updateMedia(mediaId, file, internalToken, email, role);
            return ResponseEntity.ok(updatedMedia);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de la mise à jour du média.");
        }
    }

}
