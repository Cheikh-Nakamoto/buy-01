package com.example.buy01.product.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.buy01.product.model.Product;

import java.util.List;

public interface 
ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByUserId(String userId);

    void deleteBySellerId(String sellerId);

}
