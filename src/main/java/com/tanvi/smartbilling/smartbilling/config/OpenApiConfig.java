package com.tanvi.smartbilling.smartbilling.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Smart Billing Application API",
        version = "1.0",
        description = "REST APIs for Smart Billing System using Spring Boot and MySQL",
        contact = @Contact(
            name = "Tanvi Kannawar",
            email = "tanvi@example.com"
        )
    )
)
public class OpenApiConfig {

}