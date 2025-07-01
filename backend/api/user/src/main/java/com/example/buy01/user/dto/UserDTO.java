package com.example.buy01.user.dto;

import com.example.buy01.user.model.UserRoleType.UserRole;

import lombok.Data;

@Data
public class UserDTO {
    private String name;
    private String email;
    private UserRole role;
    private String avatar;

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

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}

