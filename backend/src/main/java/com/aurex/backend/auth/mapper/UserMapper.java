package com.aurex.backend.auth.mapper;

import com.aurex.backend.auth.dto.CurrentUserResponse;
import com.aurex.backend.user.entity.User;

public final class UserMapper {

    private UserMapper() {}

    public static CurrentUserResponse toCurrentUserResponse(User user) {
        return new CurrentUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}
