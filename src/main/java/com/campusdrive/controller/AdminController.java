package com.campusdrive.controller;

import com.campusdrive.dto.*;
import com.campusdrive.entity.User;
import com.campusdrive.security.CustomUserDetails;
import com.campusdrive.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.createUser(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(
            Authentication authentication) {
        User user = ((CustomUserDetails) authentication.getPrincipal()).getUser();
        return ResponseEntity.ok(userService.getDashboardStats(user));
    }
}
