package com.example.buy01.media.controller;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.media.model.Media;
import com.example.buy01.media.service.MediaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Gestion des médias liés aux produits")
public class MediaController {

    @Autowired
    private MediaService mediaService;

    @Operation(summary = "Uploader un fichier média pour un produit", description = "Upload d’un fichier image lié à un produit (externe ou interne)")
    @ApiResponse(responseCode = "200", description = "Fichier uploadé avec succès")
    @ApiResponse(responseCode = "400", description = "Requête invalide ou headers manquants")
    @ApiResponse(responseCode = "500", description = "Erreur serveur")
    @PostMapping(value = "/upload/{productId}", consumes = "multipart/form-data")
    public ResponseEntity<?> upload(
            @Parameter(description = "ID du produit") @PathVariable String productId,
            @Parameter(description = "Fichier image") @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        try {
            Media media = mediaService.store(file, productId, internalToken, email, role);
            return ResponseEntity.ok(media);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors du téléchargement: " + e.getMessage());
        }
    }

    @Operation(summary = "Récupérer les médias d’un produit", description = "Retourne tous les médias liés à un ID produit (usage interne)")
    @ApiResponse(responseCode = "200", description = "Liste des médias retournée")
    @ApiResponse(responseCode = "404", description = "Aucun média trouvé")
    @ApiResponse(responseCode = "500", description = "Erreur serveur")
    @GetMapping("/get/{productId}")
    public ResponseEntity<?> getMediaByProductId(
            @Parameter(description = "ID du produit") @PathVariable String productId,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken) {
        try {
            List<Media> media = mediaService.getMediaByProductId(productId, internalToken);
            return ResponseEntity.ok(media);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la récupération des médias: " + e.getMessage());
        }
    }

    @Operation(summary = "Supprimer un média", description = "Supprime un média par son ID (accès restreint)")
    @ApiResponse(responseCode = "200", description = "Média supprimé avec succès")
    @ApiResponse(responseCode = "500", description = "Erreur serveur")
    @DeleteMapping("/delete/{mediaId}")
    public ResponseEntity<?> deleteMedia(
            @Parameter(description = "ID du média") @PathVariable String mediaId,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        try {
            mediaService.deleteMedia(mediaId, internalToken, email, role);
            return ResponseEntity.ok("Media deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la suppression du média: " + e.getMessage());
        }
    }

    @Operation(summary = "Supprimer tous les médias liés à un produit (interne)", description = "Suppression en cascade de tous les médias liés à un produit")
    @ApiResponse(responseCode = "200", description = "Médias supprimés avec succès")
    @ApiResponse(responseCode = "500", description = "Erreur serveur")
    @DeleteMapping("/internal/delete/product/{productId}")
    public ResponseEntity<?> deleteMediaByProductId(
            @Parameter(description = "ID du produit") @PathVariable String productId,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = true) String internalToken) {
        try {
            mediaService.deleteMediaByProductId(productId, internalToken);
            return ResponseEntity.ok("Medias deleted successfully for product ID: " + productId);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur lors de la suppression des médias pour le produit: " + e.getMessage());
        }
    }

    @Operation(summary = "Mettre à jour un média", description = "Met à jour un fichier média existant (accès restreint)")
    @ApiResponse(responseCode = "200", description = "Média mis à jour avec succès")
    @ApiResponse(responseCode = "400", description = "Erreur de validation")
    @ApiResponse(responseCode = "500", description = "Erreur serveur")
    @PutMapping(value = "/update/{mediaId}", consumes = "multipart/form-data")
    public ResponseEntity<?> updateMedia(
            @Parameter(description = "ID du média") @PathVariable String mediaId,
            @Parameter(description = "Nouveau fichier image") @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-INTERNAL-TOKEN", required = false) String internalToken,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        try {
            Media updatedMedia = mediaService.updateMedia(mediaId, file, internalToken, email, role);
            return ResponseEntity.ok(updatedMedia);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur lors de la mise à jour du média: " + e.getMessage());
        }
    }
}
