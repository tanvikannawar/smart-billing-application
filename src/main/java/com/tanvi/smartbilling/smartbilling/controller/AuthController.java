package com.tanvi.smartbilling.smartbilling.controller;

import com.tanvi.smartbilling.smartbilling.dto.LoginRequest;
import com.tanvi.smartbilling.smartbilling.dto.LoginResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String USERNAME = "admin";
    private static final String PASSWORD = "admin123";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        if (USERNAME.equals(request.getUsername())
                && PASSWORD.equals(request.getPassword())) {

            LoginResponse response = new LoginResponse(
                    request.getUsername(),
                    "Login Successful"
            );

            return ResponseEntity.ok(response);
        }

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid Username or Password");
    }
}