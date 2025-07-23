package com.example.buy01.product.service;

import org.springframework.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.buy01.product.dto.UserDTO;

@Component
public class UserClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${internal.token}")
    private String internalToken;

    public UserDTO getUserByEmail(String email) {
        try {
            String url = "http://user-service/api/users/internal/email/" + email;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-TOKEN", internalToken);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<UserDTO> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    UserDTO.class);

            return response.getBody();
        } catch (RestClientException e) {
            // Log the error and return null or throw an exception as needed
            return null;
        }
    }

    public String getSellerNameById(String userId) {
        try {
            String url = "http://user-service/api/users/internal/name/" + userId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-INTERNAL-TOKEN", internalToken);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    String.class);

            return response.getBody();
        } catch (RestClientException e) {
            return null;
        }
    }
}
