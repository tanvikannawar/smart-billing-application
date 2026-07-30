package com.tanvi.smartbilling.smartbilling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tanvi.smartbilling.smartbilling.entity.InvoiceItem;

public interface InvoiceItemRepository
        extends JpaRepository<InvoiceItem, Long> {

}