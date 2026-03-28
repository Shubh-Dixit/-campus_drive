package com.campusdrive.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Campus Drive Backend is running perfectly! 🚀";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
