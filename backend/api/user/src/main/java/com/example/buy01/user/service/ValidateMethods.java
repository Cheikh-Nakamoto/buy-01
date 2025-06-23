package com.example.letsplay.service;

import java.util.regex.Pattern;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;

import com.example.letsplay.exception.InvalidException;
import com.example.letsplay.model.Product;
import com.example.letsplay.model.User;

@Component
public class ValidateMethods {

    private static final Pattern MONGO_KEY_PATTERN = Pattern.compile(".*[.$].*");
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@[\\w-]+\\.[a-zA-Z]{2,}$");

    // Validation de l'ID
    public void validateObjectId(String id) {
        if (!ObjectId.isValid(id)) {
            throw new InvalidException("ID invalid");
        }
    }

    // Validation de l'email
    public void validateEmail(String email) {
        if (email == null || !email.matches(EMAIL_PATTERN.pattern())) {
            throw new InvalidException("Email invalid");
        }
    }

    public static void validateUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("Les données utilisateur sont manquantes");
        }

        sanitizeField(user.getName(), "Name");
        sanitizeField(user.getRole(), "Role");

        // Vérification spécifique pour les rôles
        if (!user.getRole().matches("USER|ADMIN")) {
            throw new IllegalArgumentException("Le rôle doit être USER ou ADMIN");
        }
    }
}
