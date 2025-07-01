package com.example.buy01.user.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.buy01.user.model.User;


// Adapte le modèle User pour Spring Security
// Classe qui implémente UserDetails pour Spring Security
// Cette classe est utilisée pour représenter les détails de l'utilisateur lors de l'authentification
// Elle contient les informations de l'utilisateur, y compris son rôle et ses autorisations
public class UserDetailsImpl implements UserDetails {

    private User user;
    private String id;
    
    public UserDetailsImpl(User user) {
        this.user = user;
        this.id = user.getId();
    }

    public String getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toString().toUpperCase()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}

