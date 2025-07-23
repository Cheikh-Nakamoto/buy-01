package com.example.buy01.product.event;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.buy01.product.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDeletedConsumer {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserDeletedConsumer.class);

    private final ProductRepository productRepository;

    @KafkaListener(topics = "user-deleted-topic", groupId = "product-service-group")
    public void consumeUserDeleted(UserDeletedEvent event) {
        String sellerId = event.getUserId();
        //productRepository.deleteBySellerId(sellerId);
        log.info("Produits du vendeur {} supprimés", sellerId);
    }
}
