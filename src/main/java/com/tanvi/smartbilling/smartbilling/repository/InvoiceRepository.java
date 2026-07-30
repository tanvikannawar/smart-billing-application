package com.tanvi.smartbilling.smartbilling.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.tanvi.smartbilling.smartbilling.entity.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT COALESCE(SUM(i.totalAmount),0) FROM Invoice i")
    BigDecimal getTotalSales();

    List<Invoice> findByCustomerNameContainingIgnoreCase(String customerName);

}