package com.example.buy01.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

public class ProductUpdateDTO {
    private String name;
    private String description;
    @Positive
    @Min(1)
    private Double price;
    @Positive
    @Min(1)
    private Integer quantity;
    
    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

}
