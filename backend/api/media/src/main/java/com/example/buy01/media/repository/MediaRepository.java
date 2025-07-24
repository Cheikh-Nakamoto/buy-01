package com.example.buy01.media.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.buy01.media.model.Media;

import java.util.List;

@Repository
public interface MediaRepository extends MongoRepository<Media, String> {

    List<Media> findByProductId(String productId);

}
