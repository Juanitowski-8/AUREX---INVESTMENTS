package com.aurex.backend.auth.dto;

import com.aurex.backend.user.entity.Role;
import java.util.UUID;

public record CurrentUserResponse(UUID id, String fullName, String email, Role role) {}
