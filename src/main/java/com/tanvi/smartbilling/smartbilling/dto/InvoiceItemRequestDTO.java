package com.tanvi.smartbilling.smartbilling.dto;

public class InvoiceItemRequestDTO {

    private Long productId;
    private Integer quantity;

    public InvoiceItemRequestDTO() {
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}