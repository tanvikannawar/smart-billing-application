package com.tanvi.smartbilling.smartbilling.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tanvi.smartbilling.smartbilling.entity.Customer;
import com.tanvi.smartbilling.smartbilling.service.CustomerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customer Management", description = "APIs for managing customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(summary = "Add a new customer")
    @PostMapping
    public Customer addCustomer(@Valid @RequestBody Customer customer) {
        return customerService.addCustomer(customer);
    }

    @Operation(summary = "Get all customers")
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @Operation(summary = "Search customers")
    @GetMapping("/search")
    public List<Customer> searchCustomers(
            @RequestParam(name = "keyword", required = false) String keyword) {

        return customerService.searchCustomers(keyword);
    }

    @Operation(summary = "Get customer by ID")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {

        Customer customer = customerService.getCustomerById(id);

        if (customer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(customer);
    }

    @Operation(summary = "Update a customer")
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody Customer customer) {

        Customer updatedCustomer =
                customerService.updateCustomer(id, customer);

        if (updatedCustomer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCustomer);
    }

    @Operation(summary = "Delete a customer")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable Long id) {

        Customer customer = customerService.getCustomerById(id);

        if (customer == null) {
            return ResponseEntity.notFound().build();
        }

        customerService.deleteCustomer(id);

        return ResponseEntity.ok("Customer deleted successfully");
    }
}