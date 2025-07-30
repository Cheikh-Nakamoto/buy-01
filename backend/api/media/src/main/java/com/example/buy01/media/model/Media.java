package com.example.buy01.media.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


@Data
@Document(collection = "media")
public class Media {
    public Media(String string, String productId2) {
        this.imagePath = string;
        this.productId = productId2;
    }
    
    @Id
    private String id;
    private String imagePath;
    private String productId;
}
