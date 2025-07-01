package com.example.buy01.service;

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

    public static void validateProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("Les données produits sont manquantes");
        }

        sanitizeField(product.getName(), "Name");
        sanitizeField(product.getDescription(), "Description");
    }

    private static void sanitizeField(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " ne peut pas être vide");
        }

        if (MONGO_KEY_PATTERN.matcher(value).find()) {
            throw new IllegalArgumentException(
                    fieldName + " contient des caractères non autorisés pour MongoDB ($ ou .)");
        }

        if (SCRIPT_PATTERN.matcher(value).find()) {
            throw new IllegalArgumentException(fieldName + " contient un script potentiellement malveillant");
        }

        if (value.length() > 255) {
            throw new IllegalArgumentException(fieldName + " est trop long");
        }
    }

}
