package com.example.buy01.media.utils;

import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class FileValidator {

    private static final List<String> ALLOWED_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");

    public static boolean isValidImage(MultipartFile file) {
        return file != null
            && file.getSize() <= 2 * 1024 * 1024 // 2 Mo
            && ALLOWED_TYPES.contains(file.getContentType());
    }
}
