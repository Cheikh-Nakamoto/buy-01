package com.example.buy01.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.example.buy01.product.dto.UserDTO;

@Component
public class UserClient {

    @Autowired
    private RestTemplate restTemplate;

    public UserDTO getUserByEmail(String email) {
        try {
            String url = "http://user-service/api/users/email/" + email;
            return restTemplate.getForObject(url, UserDTO.class);
        } catch (RestClientException e) {
            return null;
        }
    }

    public String getSellerNameById(String userId) {
        try {
            String url = "http://user-service/api/users/name/" + userId;
            return restTemplate.getForObject(url, String.class);
        } catch (RestClientException e) {
            return null;
        }
    }
}
