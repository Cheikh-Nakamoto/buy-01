package com.example.buy01.product.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.buy01.product.service.ProductService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KafkaUserConsumer {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(KafkaUserConsumer.class);

    @Autowired
    private ProductService productService;

    @KafkaListener(topics = "user-deleted-topic", groupId = "product-service-group")
    public void consumeUserDeleted(String userId) {
        log.info("📥 Event reçu - suppression utilisateur : {}", userId);
        productService.deleteAllProductsByUserId(userId);
        log.info("Produits du vendeur {} supprimés", userId);
    }
}
