package com.tanvi.smartbilling.smartbilling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.tanvi.smartbilling.smartbilling.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT COUNT(p) FROM Product p WHERE p.quantity <= 5")
    long countLowStockProducts();

    List<Product> findByProductNameContainingIgnoreCase(String keyword);
}