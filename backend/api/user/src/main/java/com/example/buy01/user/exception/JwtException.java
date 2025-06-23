package com.example.letsplay.exception;

public class JwtException extends RuntimeException {
    public JwtException(String message) {
        super(message);
    }
}

