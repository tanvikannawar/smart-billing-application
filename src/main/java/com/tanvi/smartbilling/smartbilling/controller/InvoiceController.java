package com.tanvi.smartbilling.smartbilling.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tanvi.smartbilling.smartbilling.dto.InvoiceRequestDTO;
import com.tanvi.smartbilling.smartbilling.entity.Invoice;
import com.tanvi.smartbilling.smartbilling.service.InvoiceService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/invoices")
@Tag(
        name = "Invoice Management",
        description = "APIs for managing invoices"
)
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @Operation(
            summary = "Create a new invoice with multiple products"
    )
    @PostMapping
    public ResponseEntity<Invoice> createInvoice(
            @RequestBody InvoiceRequestDTO request
    ) {

        Invoice invoice =
                invoiceService.createInvoice(request);

        return ResponseEntity.ok(invoice);
    }

    @Operation(summary = "Get all invoices")
    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    @Operation(summary = "Search invoices by customer name")
    @GetMapping("/search")
    public List<Invoice> searchInvoices(
            @RequestParam String customerName
    ) {
        return invoiceService.searchInvoices(customerName);
    }

    @Operation(summary = "Get invoice by ID")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Invoice> getInvoiceById(
            @PathVariable Long id
    ) {

        Invoice invoice =
                invoiceService.getInvoiceById(id);

        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(invoice);
    }

    @Operation(summary = "Update an invoice")
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Invoice> updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice invoice
    ) {

        Invoice updatedInvoice =
                invoiceService.updateInvoice(id, invoice);

        if (updatedInvoice == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedInvoice);
    }

    @Operation(summary = "Delete an invoice")
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<String> deleteInvoice(
            @PathVariable Long id
    ) {

        Invoice invoice =
                invoiceService.getInvoiceById(id);

        if (invoice == null) {
            return ResponseEntity.notFound().build();
        }

        invoiceService.deleteInvoice(id);

        return ResponseEntity.ok(
                "Invoice deleted successfully"
        );
    }
}