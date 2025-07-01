package com.example.buy01.repository;

import com.example.letsplay.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByUserId(String userId);

    void deleteBySellerId(String sellerId);

}
