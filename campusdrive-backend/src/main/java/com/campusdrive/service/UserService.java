package com.campusdrive.service;

import com.campusdrive.dto.*;
import com.campusdrive.entity.User;
import java.util.List;

public interface UserService {
    UserDto createUser(CreateUserRequest request);
    List<UserDto> getAllUsers();
    UserDto getUserById(Long id);
    void deleteUser(Long id);
    UserDto updateUserRole(Long id, String role);
    DashboardStats getDashboardStats(User currentUser);
}
