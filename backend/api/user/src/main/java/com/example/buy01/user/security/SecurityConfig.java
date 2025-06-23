package com.example.letsplay.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

//Configuration de Spring Security
// Cette classe configure la sécurité de l'application, y compris les filtres d'authentification et les règles d'autorisation
// Elle utilise JWT pour l'authentification et définit les rôles d'accès pour différentes parties de l'application

@Configuration // Indique que cette classe est une configuration Spring
@EnableWebSecurity // Active la sécurité web de Spring
@EnableMethodSecurity(prePostEnabled = true, jsr250Enabled = true) // Permet la sécurité au niveau des méthodes et
                                                                   // active la sécurité JSR-250
@RequiredArgsConstructor // Génère un constructeur avec les champs finaux
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> corsConfigurationSource())
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/users/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/products/**").permitAll()
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // 💡 Configuration de l'AuthenticationManager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // 💡 Configuration CORS globale
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:4200")); // 🔁 Autoriser ton frontend
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE")); // 📦 Méthodes acceptées
        config.setAllowedHeaders(List.of("Authorization", "Content-Type")); // 📩 Headers autorisés
        config.setAllowCredentials(true); // 🔒 Pour envoyer des tokens/cookies

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // ✅ S'applique à toutes les routes

        return source;
    }

    /*
     * @Bean
     * public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilter() {
     * FilterRegistrationBean<RateLimitingFilter> registrationBean = new
     * FilterRegistrationBean<>();
     * registrationBean.setFilter(new RateLimitingFilter());
     * registrationBean.addUrlPatterns("/api/auth/login"); // Appliquer uniquement
     * sur login
     * return registrationBean;
     * }// Filtre de rate limiting pour limiter les requêtes sur /auth/login,
     * insértion
     * // manuelle du filtre
     */
}
