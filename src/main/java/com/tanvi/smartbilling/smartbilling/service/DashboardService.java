package com.tanvi.smartbilling.smartbilling.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.tanvi.smartbilling.smartbilling.dto.DashboardDTO;
import com.tanvi.smartbilling.smartbilling.repository.CustomerRepository;
import com.tanvi.smartbilling.smartbilling.repository.InvoiceRepository;
import com.tanvi.smartbilling.smartbilling.repository.ProductRepository;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardService(ProductRepository productRepository,
                            CustomerRepository customerRepository,
                            InvoiceRepository invoiceRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public DashboardDTO getDashboardData() {

        long totalProducts = productRepository.count();
        long totalCustomers = customerRepository.count();
        long totalInvoices = invoiceRepository.count();

        BigDecimal totalSales = invoiceRepository.getTotalSales();

        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        long lowStockProducts = productRepository.countLowStockProducts();

        return new DashboardDTO(
                totalProducts,
                totalCustomers,
                totalInvoices,
                totalSales,
                lowStockProducts
        );
    }
}