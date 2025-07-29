package com.example.buy01.user.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KafkaUserProducer {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(KafkaUserProducer.class);

    private final KafkaTemplate<String, String> kafkaTemplateDeleted;

    public void sendUserDeletedEvent(String userId) {
        // Send the event to the Kafka topic
        kafkaTemplateDeleted.send("user-deleted-topic", userId);

        log.info("Sending user deleted event for userId: {}", userId);
    }
}
