# Smart Billing Application

## Project Overview

The Smart Billing Application is a backend REST API developed using Spring Boot and MySQL. It allows users to manage products, customers, and invoices with automatic billing and stock management.

---

## Features

### Product Management
- Add Product
- View All Products
- View Product by ID
- Update Product
- Delete Product
- Product Validation

### Customer Management
- Add Customer
- View All Customers
- View Customer by ID
- Update Customer
- Delete Customer
- Customer Validation

### Invoice Management
- Generate Invoice
- Automatic Bill Calculation
- Automatic Stock Update
- View All Invoices
- View Invoice by ID
- Update Invoice
- Delete Invoice

### Exception Handling
- Customer Not Found
- Product Not Found
- Invalid Quantity
- Insufficient Stock
- Validation Errors

### API Documentation
Swagger UI is integrated for testing all REST APIs.

Swagger URL:

http://localhost:8080/swagger-ui/index.html

---

## Technologies Used

- Java 21
- Spring Boot 3.5.4
- Spring Web
- Spring Data JPA
- Hibernate
- MySQL
- Maven
- Swagger OpenAPI
- Thunder Client
- Visual Studio Code

---

## Database

Database Name

smartbilling

---

## REST APIs

### Product APIs

POST /api/products

GET /api/products

GET /api/products/{id}

PUT /api/products/{id}

DELETE /api/products/{id}

---

### Customer APIs

POST /api/customers

GET /api/customers

GET /api/customers/{id}

PUT /api/customers/{id}

DELETE /api/customers/{id}

---

### Invoice APIs

POST /api/invoices

GET /api/invoices

GET /api/invoices/{id}

PUT /api/invoices/{id}

DELETE /api/invoices/{id}

---

## Project Structure

src

controller

entity

repository

service

exception

resources

pom.xml

README.md

---

## How to Run

1. Create MySQL database

smartbilling

2. Configure application.properties

3. Run

.\mvnw.cmd spring-boot:run

4. Open Swagger

http://localhost:8080/swagger-ui/index.html

---

## Developer

Tanvi Kannawar

Final Year Information Technology Student