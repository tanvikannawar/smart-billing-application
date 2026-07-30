package com.tanvi.smartbilling.smartbilling.dto;

import java.math.BigDecimal;

public class DashboardDTO {

    private long totalProducts;
    private long totalCustomers;
    private long totalInvoices;
    private BigDecimal totalSales;
    private long lowStockProducts;

    // Default Constructor
    public DashboardDTO() {
    }

    // Parameterized Constructor
    public DashboardDTO(long totalProducts, long totalCustomers,
                        long totalInvoices, BigDecimal totalSales,
                        long lowStockProducts) {
        this.totalProducts = totalProducts;
        this.totalCustomers = totalCustomers;
        this.totalInvoices = totalInvoices;
        this.totalSales = totalSales;
        this.lowStockProducts = lowStockProducts;
    }

    // Getters and Setters

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalInvoices() {
        return totalInvoices;
    }

    public void setTotalInvoices(long totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
}