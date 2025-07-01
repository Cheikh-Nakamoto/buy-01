package com.example.buy01.user.event;

import com.example.buy01.user.model.UserRoleType.UserRole;

import lombok.Data;

@Data
public class UserRegisteredEvent {
    private String userId;
    private String email;
    private UserRole role;
}