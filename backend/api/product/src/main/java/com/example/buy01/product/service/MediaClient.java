package com.example.buy01.product.service;

import org.springframework.http.HttpHeaders;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.product.dto.MediaDTO;

@Component
public class MediaClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${internal.token}")
    private String internalToken;

    public MediaDTO store(MultipartFile file, String productId) {
    try {
        String url = "http://media-service/api/media/internal/upload/" + productId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-INTERNAL-TOKEN", internalToken);

        // Convert MultipartFile to a real file
        File tempFile = File.createTempFile("upload-", file.getOriginalFilename());
        file.transferTo(tempFile);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(tempFile));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);


        ResponseEntity<MediaDTO> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                MediaDTO.class);

        // Clean up the temporary file
        tempFile.delete();

        return response.getBody();

    } catch (IOException e) {
        System.err.println("❌ Erreur de conversion du fichier : " + e.getMessage());
        return null;
    } catch (RestClientException e) {
        System.err.println("❌ Erreur d’appel à media-service : " + e.getMessage());
        return null;
    }
}


    public List<MediaDTO> getMediasByProductId(String productId) {
        try {
            String url = "http://media-service/api/media/internal/get/" + productId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-TOKEN", internalToken);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<List<MediaDTO>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    new org.springframework.core.ParameterizedTypeReference<List<MediaDTO>>() {
                    });

            return response.getBody();
        } catch (RestClientException e) {
            System.err.println("❌ Erreur d’appel à media-service : " + e.getMessage());
            return null;
        }
    }

    public void deleteMediaByProductId(String id) {
        try {
            String url = "http://media-service/api/media/internal/delete/medias/" + id;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-TOKEN", internalToken);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, Void.class);
        } catch (RestClientException e) {
            System.err.println("❌ Erreur d’appel à media-service pour supprimer le média : " + e.getMessage());
        }
    }
}
