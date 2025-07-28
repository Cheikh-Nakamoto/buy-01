package com.example.buy01.user.security;

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
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.config.Customizer;

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
    private UserDetailsService userDetailsService;

    @Autowired
    private GatewayAuthFilter gatewayAuthFilter;

    @Autowired
    private InternalAccessFilter internalAccessFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/avatars/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**")
                        .permitAll()
                        .requestMatchers("/api/users/internal/**").hasAuthority("INTERNAL_ACCESS")
                        .anyRequest().authenticated())
                .addFilterBefore(gatewayAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(internalAccessFilter, GatewayAuthFilter.class);
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
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}
