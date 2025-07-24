package com.example.buy01.media.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@Document(collection = "media")
public class Media {
    @Id
    private String id;
    private String imagePath;
    private String productId;
}
