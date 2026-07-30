package com.tanvi.smartbilling.smartbilling.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tanvi.smartbilling.smartbilling.entity.Customer;
import com.tanvi.smartbilling.smartbilling.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer addCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id).orElse(null);
    }

    public Customer updateCustomer(Long id, Customer customer) {
        Customer existingCustomer = customerRepository.findById(id).orElse(null);

        if (existingCustomer != null) {
            existingCustomer.setCustomerName(customer.getCustomerName());
            existingCustomer.setEmail(customer.getEmail());
            existingCustomer.setPhone(customer.getPhone());

            return customerRepository.save(existingCustomer);
        }

        return null;
    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }
public List<Customer> searchCustomers(String keyword) {

    if (keyword == null || keyword.trim().isEmpty()) {
        return customerRepository.findAll();
    }

    String searchText = keyword.trim();

    return customerRepository
            .findByCustomerNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(
                    searchText,
                    searchText,
                    searchText
            );
}
}