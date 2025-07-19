package com.example.buy01.gateway_service.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Refill;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.GatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimiterFilter implements GatewayFilterFactory<Object> {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            String ip = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");

            if (ip == null) {
                java.net.SocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
                if (remoteAddress instanceof java.net.InetSocketAddress) {
                    java.net.InetSocketAddress inetSocketAddress = (java.net.InetSocketAddress) remoteAddress;
                    if (inetSocketAddress.getAddress() != null) {
                        ip = inetSocketAddress.getAddress().getHostAddress();
                    } else {
                        ip = "unknown";
                    }
                } else {
                    ip = "unknown";
                }
            }

            // Appliquer uniquement sur /api/auth/login
            if (path.equals("/api/auth/login")) {
                Bucket bucket = buckets.computeIfAbsent(ip, this::newBucket);
                if (bucket.tryConsume(1)) {
                    return chain.filter(exchange);
                } else {
                    exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                    return exchange.getResponse().setComplete();
                }
            }

            return chain.filter(exchange);
        };
    }

    private Bucket newBucket(String ip) {
        Refill refill = Refill.intervally(5, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(5, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    public Class<Object> getConfigClass() {
        return Object.class;
    }

    @Override
    public String name() {
        return "RateLimiter";
    }
}
