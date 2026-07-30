package com.tanvi.smartbilling.smartbilling.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tanvi.smartbilling.smartbilling.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer>
            findByCustomerNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneContaining(
                    String customerName,
                    String email,
                    String phone
            );
}