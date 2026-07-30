package com.tanvi.smartbilling.smartbilling.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tanvi.smartbilling.smartbilling.dto.InvoiceItemRequestDTO;
import com.tanvi.smartbilling.smartbilling.dto.InvoiceRequestDTO;
import com.tanvi.smartbilling.smartbilling.entity.Customer;
import com.tanvi.smartbilling.smartbilling.entity.Invoice;
import com.tanvi.smartbilling.smartbilling.entity.InvoiceItem;
import com.tanvi.smartbilling.smartbilling.entity.Product;
import com.tanvi.smartbilling.smartbilling.exception.BillingException;
import com.tanvi.smartbilling.smartbilling.repository.CustomerRepository;
import com.tanvi.smartbilling.smartbilling.repository.InvoiceRepository;
import com.tanvi.smartbilling.smartbilling.repository.ProductRepository;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    /*
     * GST rates:
     * CGST = 9%
     * SGST = 9%
     * Total GST = 18%
     */
    private static final BigDecimal CGST_RATE =
            new BigDecimal("0.09");

    private static final BigDecimal SGST_RATE =
            new BigDecimal("0.09");

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository) {

        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    /*
     * Creates one invoice containing multiple products.
     * Stock is reduced for every product added to the invoice.
     */
    @Transactional
    public Invoice createInvoice(InvoiceRequestDTO request) {

        if (request == null) {
            throw new BillingException(
                    "Invoice request is required"
            );
        }

        if (request.getCustomerId() == null) {
            throw new BillingException(
                    "Customer ID is required"
            );
        }

        if (
                request.getItems() == null ||
                request.getItems().isEmpty()
        ) {
            throw new BillingException(
                    "At least one product is required"
            );
        }

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new BillingException(
                                "Customer not found with ID: "
                                        + request.getCustomerId()
                        )
                );

        Invoice invoice = new Invoice();

        invoice.setCustomerName(
                customer.getCustomerName()
        );

        invoice.setCustomerEmail(
                customer.getEmail()
        );

        invoice.setCustomerPhone(
                customer.getPhone()
        );

        /*
         * Stores total amount before GST.
         */
        BigDecimal invoiceSubTotal = BigDecimal.ZERO;

        for (
                InvoiceItemRequestDTO itemRequest :
                request.getItems()
        ) {

            if (itemRequest == null) {
                throw new BillingException(
                        "Invoice item cannot be empty"
                );
            }

            if (itemRequest.getProductId() == null) {
                throw new BillingException(
                        "Product ID is required"
                );
            }

            if (
                    itemRequest.getQuantity() == null ||
                    itemRequest.getQuantity() <= 0
            ) {
                throw new BillingException(
                        "Quantity must be greater than 0"
                );
            }

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() ->
                            new BillingException(
                                    "Product not found with ID: "
                                            + itemRequest.getProductId()
                            )
                    );

            if (product.getQuantity() <= 0) {
                throw new BillingException(
                        product.getProductName()
                                + " is out of stock"
                );
            }

            if (
                    itemRequest.getQuantity() >
                    product.getQuantity()
            ) {
                throw new BillingException(
                        "Insufficient stock for "
                                + product.getProductName()
                                + ". Available quantity: "
                                + product.getQuantity()
                );
            }

            /*
             * Item subtotal:
             * product price × requested quantity
             */
            BigDecimal itemSubTotal = product
                    .getPrice()
                    .multiply(
                            BigDecimal.valueOf(
                                    itemRequest.getQuantity()
                            )
                    )
                    .setScale(
                            2,
                            RoundingMode.HALF_UP
                    );

            InvoiceItem invoiceItem =
                    new InvoiceItem();

            invoiceItem.setProductName(
                    product.getProductName()
            );

            invoiceItem.setProductPrice(
                    product.getPrice()
            );

            /*
             * Saves the exact Product relationship.
             * This is required for stock restoration.
             */
            invoiceItem.setProduct(product);

            invoiceItem.setQuantity(
                    itemRequest.getQuantity()
            );

            invoiceItem.setSubTotal(
                    itemSubTotal
            );

            /*
             * Adds the item and connects it to the invoice.
             */
            invoice.addItem(invoiceItem);

            /*
             * Add this item's subtotal to invoice subtotal.
             */
            invoiceSubTotal =
                    invoiceSubTotal.add(itemSubTotal);

            /*
             * Reduce product stock.
             */
            product.setQuantity(
                    product.getQuantity()
                            - itemRequest.getQuantity()
            );

            productRepository.save(product);
        }

        /*
         * Round subtotal to two decimal places.
         */
        invoiceSubTotal =
                invoiceSubTotal.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Calculate 9% CGST.
         */
        BigDecimal cgst = invoiceSubTotal
                .multiply(CGST_RATE)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Calculate 9% SGST.
         */
        BigDecimal sgst = invoiceSubTotal
                .multiply(SGST_RATE)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        /*
         * Final total:
         * subtotal + CGST + SGST
         */
        BigDecimal finalTotal = invoiceSubTotal
                .add(cgst)
                .add(sgst)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        invoice.setSubTotal(invoiceSubTotal);
        invoice.setCgst(cgst);
        invoice.setSgst(sgst);
        invoice.setTotalAmount(finalTotal);

        /*
         * Temporary compatibility fields.
         */
        invoice.setProductName("Multiple Items");
        invoice.setProductPrice(BigDecimal.ZERO);
        invoice.setQuantity(
                request.getItems().size()
        );

        return invoiceRepository.save(invoice);
    }

    /*
     * Returns all invoices.
     */
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    /*
     * Returns one invoice using its ID.
     */
    public Invoice getInvoiceById(Long id) {

        if (id == null) {
            return null;
        }

        return invoiceRepository
                .findById(id)
                .orElse(null);
    }

    /*
     * Updates existing invoice information.
     *
     * This method updates customer and amount details only.
     * It does not update invoice items or product stock.
     */
    @Transactional
    public Invoice updateInvoice(
            Long id,
            Invoice invoice) {

        if (id == null || invoice == null) {
            return null;
        }

        Invoice existingInvoice = invoiceRepository
                .findById(id)
                .orElse(null);

        if (existingInvoice == null) {
            return null;
        }

        existingInvoice.setCustomerName(
                invoice.getCustomerName()
        );

        existingInvoice.setCustomerEmail(
                invoice.getCustomerEmail()
        );

        existingInvoice.setCustomerPhone(
                invoice.getCustomerPhone()
        );

        if (invoice.getSubTotal() != null) {
            existingInvoice.setSubTotal(
                    invoice.getSubTotal()
            );
        }

        if (invoice.getCgst() != null) {
            existingInvoice.setCgst(
                    invoice.getCgst()
            );
        }

        if (invoice.getSgst() != null) {
            existingInvoice.setSgst(
                    invoice.getSgst()
            );
        }

        if (invoice.getTotalAmount() != null) {
            existingInvoice.setTotalAmount(
                    invoice.getTotalAmount()
            );
        }

        if (invoice.getInvoiceDate() != null) {
            existingInvoice.setInvoiceDate(
                    invoice.getInvoiceDate()
            );
        }

        return invoiceRepository.save(
                existingInvoice
        );
    }

    /*
     * Deletes an invoice and restores stock
     * for every product in that invoice.
     */
    @Transactional
    public void deleteInvoice(Long id) {

        if (id == null) {
            throw new BillingException(
                    "Invoice ID is required"
            );
        }

        Invoice invoice = invoiceRepository
                .findById(id)
                .orElseThrow(() ->
                        new BillingException(
                                "Invoice not found with ID: "
                                        + id
                        )
                );

        /*
         * Restore stock for every invoice item.
         */
        for (InvoiceItem item : invoice.getItems()) {

            Product product = item.getProduct();

            if (product != null) {

                product.setQuantity(
                        product.getQuantity()
                                + item.getQuantity()
                );

                productRepository.save(product);
            }
        }

        /*
         * Invoice items are automatically deleted because
         * Invoice uses cascade = CascadeType.ALL.
         */
        invoiceRepository.delete(invoice);
    }

    /*
     * Searches invoices by customer name.
     */
    public List<Invoice> searchInvoices(
            String customerName) {

        if (
                customerName == null ||
                customerName.trim().isEmpty()
        ) {
            return invoiceRepository.findAll();
        }

        return invoiceRepository
                .findByCustomerNameContainingIgnoreCase(
                        customerName.trim()
                );
    }
}