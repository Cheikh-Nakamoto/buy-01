package com.example.buy01.media.service;

import org.springframework.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.buy01.media.exception.ResourceNotFoundException;


@Component
public class ProductClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${internal.token}")
    private String internalToken;

    public boolean validateProduct(String productId, String email) {
        try {
            String url = "http://product-service/api/products/internal/validate/" + productId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-TOKEN", internalToken);
            headers.set("X-USER-EMAIL", email);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<?> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    Void.class);
                    
            System.out.println("Response status: " + response.getStatusCode());
            if (response.getStatusCode().is2xxSuccessful()) {
                return true; // Product is valid
            } else {
                return false; // Product is not valid
            }
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Error validating product: " + e.getMessage());
        }
    }
}
