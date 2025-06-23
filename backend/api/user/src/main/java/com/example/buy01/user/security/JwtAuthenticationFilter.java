package com.example.letsplay.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

//Filtre pour extraire le JWT du header de la requête
// Cette classe est responsable de l'extraction du JWT du header de la requête HTTP
// et de la validation de l'authentification de l'utilisateur

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Vérifie si le token est présent et commence par "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extrait le JWT du header
        jwt = authHeader.substring(7);
        byte[] keyBytes = jwt.getBytes(StandardCharsets.UTF_8);

        // Vérifie si la longueur de la clé est suffisante pour le traitement du JWT
        if (keyBytes.length < 32) {
            filterChain.doFilter(request, response);
            return;
        }
        
        
        try {
            // Traitement du JWT
            userEmail = jwtService.extractUsername(jwt);

            // Si le token est valide, on authentifie l'utilisateur
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                if (userDetails == null) {
                    // Si les conditions sont null ou vides, on ne fait rien
                    filterChain.doFilter(request, response);
                    return;
                    
                }
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
            return;

        } catch (ExpiredJwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            //Token Expired
            response.getWriter().write("{\"status\": "+HttpStatus.UNAUTHORIZED.value()+",\"error\":\""+HttpStatus.UNAUTHORIZED.getReasonPhrase()+"\",\"message\":\"Token Expired\",\"path\":\""+request.getRequestURI()+"\",\"timestamp\":\""+LocalDateTime.now()+"\"}");
            return;
        } catch (SignatureException | MalformedJwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            //Token Invalid
            response.getWriter().write("{\"status\": "+HttpStatus.UNAUTHORIZED.value()+",\"error\":\""+HttpStatus.UNAUTHORIZED.getReasonPhrase()+"\",\"message\":\"Token Invalid\",\"path\":\""+request.getRequestURI()+"\",\"timestamp\":\""+LocalDateTime.now()+"\"}");
            return;
        }
    }
}
