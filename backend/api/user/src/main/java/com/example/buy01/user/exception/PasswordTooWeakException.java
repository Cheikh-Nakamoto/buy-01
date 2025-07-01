package com.example.buy01.user.exception;

public class PasswordTooWeakException extends RuntimeException {
    public PasswordTooWeakException(String message) {
        super(message);
    }
}
