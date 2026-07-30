package com.tanvi.smartbilling.smartbilling.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "invoice")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;

    private String customerEmail;

    private String customerPhone;

    /*
     * Old single-product fields are temporarily retained
     * for compatibility with the earlier invoice code.
     */
    private String productName;

    private BigDecimal productPrice;

    private Integer quantity;

    /*
     * Amount before GST.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subTotal = BigDecimal.ZERO;

    /*
     * Central GST amount.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cgst = BigDecimal.ZERO;

    /*
     * State GST amount.
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal sgst = BigDecimal.ZERO;

    /*
     * Final amount:
     * subtotal + CGST + SGST
     */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDateTime invoiceDate;

    /*
     * One invoice can contain multiple invoice items.
     */
    @OneToMany(
            mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    private List<InvoiceItem> items = new ArrayList<>();

    public Invoice() {
    }

    @PrePersist
    public void setDefaultValuesBeforeSaving() {

        if (invoiceDate == null) {
            invoiceDate = LocalDateTime.now();
        }

        setDefaultAmountValues();
    }

    @PreUpdate
    public void setDefaultValuesBeforeUpdating() {
        setDefaultAmountValues();
    }

    private void setDefaultAmountValues() {

        if (subTotal == null) {
            subTotal = BigDecimal.ZERO;
        }

        if (cgst == null) {
            cgst = BigDecimal.ZERO;
        }

        if (sgst == null) {
            sgst = BigDecimal.ZERO;
        }

        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
    }

    public Long getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(BigDecimal productPrice) {
        this.productPrice = productPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(BigDecimal subTotal) {
        this.subTotal = subTotal;
    }

    public BigDecimal getCgst() {
        return cgst;
    }

    public void setCgst(BigDecimal cgst) {
        this.cgst = cgst;
    }

    public BigDecimal getSgst() {
        return sgst;
    }

    public void setSgst(BigDecimal sgst) {
        this.sgst = sgst;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDateTime invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {

        this.items.clear();

        if (items != null) {
            for (InvoiceItem item : items) {
                addItem(item);
            }
        }
    }

    /*
     * Adds an item and connects it to this invoice.
     */
    public void addItem(InvoiceItem item) {

        if (item != null) {
            items.add(item);
            item.setInvoice(this);
        }
    }

    /*
     * Removes an item from this invoice.
     */
    public void removeItem(InvoiceItem item) {

        if (item != null) {
            items.remove(item);
            item.setInvoice(null);
        }
    }
}