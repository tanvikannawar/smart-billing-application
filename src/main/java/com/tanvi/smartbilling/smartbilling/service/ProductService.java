package com.tanvi.smartbilling.smartbilling.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tanvi.smartbilling.smartbilling.entity.Product;
import com.tanvi.smartbilling.smartbilling.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = getProductById(id);

        existingProduct.setProductName(updatedProduct.getProductName());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setQuantity(updatedProduct.getQuantity());

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(Long id) {

        Product existingProduct = getProductById(id);
        productRepository.delete(existingProduct);
    }

    public List<Product> searchProducts(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll();
        }

        return productRepository.findByProductNameContainingIgnoreCase(keyword);
    }
}