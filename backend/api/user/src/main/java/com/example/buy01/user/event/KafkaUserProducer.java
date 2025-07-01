package com.example.buy01.user.event;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.example.buy01.user.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class KafkaUserProducer {

    private final KafkaTemplate<String, UserRegisteredEvent> kafkaTemplateRegistered;
    private final KafkaTemplate<String, UserDeletedEvent> kafkaTemplateDeleted;

    public void sendUserCreatedEvent(User user) {
        var event = new UserRegisteredEvent();
        event.setUserId(user.getId());
        event.setEmail(user.getEmail());
        event.setRole(user.getRole());

        // Log the event for debugging purposes
        System.out.println("Sending user registered event: " + event);
        // Send the event to the Kafka topic
        kafkaTemplateRegistered.send("user-registered-topic", event);
    }

    public void sendUserDeletedEvent(String userId) {
        UserDeletedEvent event = new UserDeletedEvent(userId);
        kafkaTemplateDeleted.send("user-deleted-topic", event);
    }

}
