package com.example.buy01.user.utils;

import java.util.List;
import java.util.regex.Pattern;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.example.buy01.user.exception.InvalidException;
import com.example.buy01.user.model.User;
import com.example.buy01.user.model.UserRoleType.UserRole;

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

    // Ajout de la méthode sanitizeField
    private static void sanitizeField(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " ne peut pas être vide");
        }
        if (MONGO_KEY_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException(fieldName + " contient des caractères non autorisés");
        }
        if (SCRIPT_PATTERN.matcher(value).find()) {
            throw new IllegalArgumentException(fieldName + " contient un script non autorisé");
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
        sanitizeField(user.getRole().name(), "Role");

        // Vérification spécifique pour les rôles
        if (!user.getRole().equals(UserRole.CLIENT) && !user.getRole().equals(UserRole.SELLER)) {
            throw new IllegalArgumentException("Le rôle doit être CLIENT ou SELLER");
        }
    }

    public boolean isImage(MultipartFile file) {
        List<String> allowed = List.of("image/jpeg", "image/png", "image/webp");
        return allowed.contains(file.getContentType());
    }
}
