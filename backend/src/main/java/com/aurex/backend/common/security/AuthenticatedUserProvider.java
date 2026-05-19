package com.aurex.backend.common.security;

import com.aurex.backend.common.exception.UnauthorizedException;
import com.aurex.backend.user.entity.User;
import com.aurex.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthenticatedUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User user) {
            return user;
        }

        String email = authentication.getName();
        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
