package com.example.buy01.user.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Filtre de rate limiting pour limiter les requêtes sur /auth/login
// Utilise Bucket4j pour gérer les quotas de requêtes par IP
// Limite à 5 requêtes par minute par IP
// Si le quota est dépassé, renvoie un code 429 (Too Many Requests) avec un message d'erreur
@Component
public class RateLimitingFilter implements Filter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String ip = req.getRemoteAddr();

        // Appliquer le rate limit uniquement sur /auth/login
        if (req.getRequestURI().equals("/api/auth/login")) {
            Bucket bucket = buckets.computeIfAbsent(ip, this::newBucket);
            if (bucket.tryConsume(1)) {
                chain.doFilter(request, response);
            } else {
                HttpServletResponse res = (HttpServletResponse) response;
                res.setStatus(429); // Too Many Requests
                res.getWriter().write("Trop de tentatives. Réessayez plus tard.");
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    private Bucket newBucket(String ip) {
        // Autorise 5 requêtes par minute
        Refill refill = Refill.intervally(5, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(5, refill);
        return Bucket.builder().addLimit(limit).build();
    }
}

