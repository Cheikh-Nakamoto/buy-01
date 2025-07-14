package com.example.buy01.user.exception;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;


import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        public ApiErrorResponse buildError(HttpServletRequest request, HttpStatus status, String message) {
                return new ApiErrorResponse(
                                status.value(),
                                status.getReasonPhrase(),
                                message,
                                request.getRequestURI());
        }

        // Gère les exceptions de validation des arguments
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                String msg = ex.getBindingResult().getFieldErrors()
                                .stream()
                                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                                .collect(Collectors.joining("; "));
                return ResponseEntity.badRequest().body(buildError(request, HttpStatus.BAD_REQUEST, msg));
        }

        // Gère les exceptions d'authentification
        @ExceptionHandler({ UsernameNotFoundException.class, BadCredentialsException.class, JwtException.class })
        public ResponseEntity<ApiErrorResponse> handleAuth(Exception ex, HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(buildError(request, HttpStatus.UNAUTHORIZED, ex.getMessage()));
        }

        // Gère les exceptions d'autorisation
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiErrorResponse> handleAccessDenied(Exception ex, HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(buildError(request, HttpStatus.FORBIDDEN, "Access denied"));
        }

        // Gère les exceptions de ressource non trouvée
        @ExceptionHandler(NoHandlerFoundException.class)
        public ResponseEntity<ApiErrorResponse> handle404(NoHandlerFoundException ex, HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(buildError(request, HttpStatus.NOT_FOUND, "Route not found"));
        }

        // Gère les exceptions de conflit, par exemple pour les doublons
        @ExceptionHandler(EmailAlreadyUsedException.class)
        public ResponseEntity<ApiErrorResponse> handleEmailAlreadyUsed(EmailAlreadyUsedException ex,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(buildError(request, HttpStatus.CONFLICT, "Email already used"));
        }

        // Gère les exceptions générales non détectés
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(buildError(request, HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage()));
        }

        @ExceptionHandler(MaxUploadSizeExceededException.class)
        public ResponseEntity<ApiErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException ex,
                        HttpServletRequest request) {
                return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                                .body(buildError(request, HttpStatus.PAYLOAD_TOO_LARGE,
                                                "Fichier trop volumineux. Taille maximale autorisée : 2 Mo."));
        }

        // Gère les exceptions spécifiques pour les mots de passe trop faibles
        @ExceptionHandler({ PasswordTooWeakException.class, InvalidException.class, IllegalArgumentException.class })
        public ResponseEntity<ApiErrorResponse> handlePasswordTooWeak(Exception ex, HttpServletRequest request) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(buildError(request, HttpStatus.BAD_REQUEST, ex.getMessage()));
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException ex,
                        HttpServletRequest request) {
                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(buildError(request, HttpStatus.NOT_FOUND, ex.getMessage()));
        }
}
