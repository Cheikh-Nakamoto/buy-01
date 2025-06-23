package com.example.letsplay.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserUpdateDTO {
    private String name;

    @Email(message = "Email invalide")
    @Size(min = 5, max = 50, message = "L'email doit contenir entre 5 et 50 caractères")
    private String email;
    
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password; // facultatif

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}