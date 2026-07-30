package com.tanvi.smartbilling.smartbilling.dto;

import java.util.List;

public class InvoiceRequestDTO {

    private Long customerId;
    private List<InvoiceItemRequestDTO> items;

    public InvoiceRequestDTO() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<InvoiceItemRequestDTO> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItemRequestDTO> items) {
        this.items = items;
    }
}