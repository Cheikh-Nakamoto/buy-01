package com.example.letsplay.service;

import java.util.regex.Pattern;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;

import com.example.letsplay.exception.InvalidException;
import com.example.letsplay.model.Product;
import com.example.letsplay.model.User;

@Component
public class ValidateMethods {

    // Validation de l'ID
    public void validateObjectId(String id) {
        if (!ObjectId.isValid(id)) {
            throw new InvalidException("ID invalid");
        }
    }
}
