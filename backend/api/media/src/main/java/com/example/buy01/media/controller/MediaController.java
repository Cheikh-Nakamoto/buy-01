package com.example.buy01.media.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.media.model.Media;
import com.example.buy01.media.service.MediaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Tag(name = "Media", description = "Gestion des médias liés aux produits")
public class MediaController {

    private final MediaService mediaService;

    @Operation(summary = "Upload d’un fichier image lié à un produit (usage interne)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Fichier uploadé avec succès"),
        @ApiResponse(responseCode = "400", description = "Requête invalide ou headers manquants"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @PostMapping(value = "internal/upload/{productId}", consumes = "multipart/form-data")
    public ResponseEntity<Media> uploadInternal(
            @Parameter(description = "ID du produit") @PathVariable String productId,
            @Parameter(description = "Fichier image") @RequestPart("file") MultipartFile file,
            @RequestHeader("X-INTERNAL-TOKEN") String internalToken) throws IOException {

        Media media = mediaService.store(file, productId, internalToken, "", "");
        return ResponseEntity.ok(media);
    }

    @Operation(summary = "Upload d’un fichier image lié à un produit (usage externe)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Fichier uploadé avec succès"),
        @ApiResponse(responseCode = "400", description = "Requête invalide ou headers manquants"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @PostMapping(value = "/add/{productId}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Media> uploadExternal(
            @Parameter(description = "ID du produit") @PathVariable String productId,
            @Parameter(description = "Fichier image") @RequestPart("file") MultipartFile file,
            @RequestHeader("X-USER-EMAIL") String email,
            @RequestHeader("X-USER-ROLE") String role) throws IOException {

        Media media = mediaService.store(file, productId, "", email, role);
        return ResponseEntity.ok(media);
    }

    @Operation(summary = "Retourne tous les médias liés à un ID produit (usage interne)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Liste des médias retournée"),
        @ApiResponse(responseCode = "404", description = "Aucun média trouvé"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @GetMapping("/internal/get/{productId}")
    public ResponseEntity<List<Media>> getMediaByProductId(
            @PathVariable String productId,
            @RequestHeader("X-INTERNAL-TOKEN") String internalToken) {

        List<Media> mediaList = mediaService.getMediaByProductId(productId, internalToken);
        return ResponseEntity.ok(mediaList);
    }

    @Operation(summary = "Supprimer un média par son ID (accès restreint)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Média supprimé avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @DeleteMapping("/delete/{mediaId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteMedia(
            @PathVariable String mediaId,
            @RequestHeader("X-USER-EMAIL") String email,
            @RequestHeader("X-USER-ROLE") String role) {

        mediaService.deleteMedia(mediaId, "", email, role);
        return ResponseEntity.ok("Media deleted successfully.");
    }

    @Operation(summary = "Supprimer tous les médias liés à un produit (interne)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Médias supprimés avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @DeleteMapping("/internal/delete/medias/{productId}")
    public ResponseEntity<String> deleteMediaByProductId(
            @PathVariable String productId,
            @RequestHeader("X-INTERNAL-TOKEN") String internalToken) {

        mediaService.deleteMediaByProductId(productId, internalToken);
        return ResponseEntity.ok("Medias deleted successfully for product ID: " + productId);
    }

    @Operation(summary = "Mettre à jour un média (accès restreint)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Média mis à jour avec succès"),
        @ApiResponse(responseCode = "400", description = "Erreur de validation"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @PutMapping(value = "/update/{mediaId}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<Media> updateMedia(
            @PathVariable String mediaId,
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-USER-EMAIL", required = false) String email,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {

        Media updated = mediaService.updateMedia(mediaId, file, "", email, role);
        return ResponseEntity.ok(updated);
    }
}
