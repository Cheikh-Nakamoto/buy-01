package com.example.buy01.product.dto;

import java.util.List;

import lombok.Data;

@Data
public class ProductDTO {
    private String id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String sellerName;
    private List<String> imageUrls;

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }
}
