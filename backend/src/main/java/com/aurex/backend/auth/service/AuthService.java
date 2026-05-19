package com.aurex.backend.auth.service;

import com.aurex.backend.auth.dto.AuthResponse;
import com.aurex.backend.auth.dto.CurrentUserResponse;
import com.aurex.backend.auth.dto.LoginRequest;
import com.aurex.backend.auth.dto.RegisterRequest;
import com.aurex.backend.auth.mapper.UserMapper;
import com.aurex.backend.common.exception.EmailAlreadyExistsException;
import com.aurex.backend.common.exception.UnauthorizedException;
import com.aurex.backend.common.security.AuthenticatedUserProvider;
import com.aurex.backend.common.security.JwtService;
import com.aurex.backend.config.JwtProperties;
import com.aurex.backend.user.entity.Role;
import com.aurex.backend.user.entity.User;
import com.aurex.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final AuthenticatedUserProvider authenticatedUserProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        User user =
                User.builder()
                        .fullName(request.fullName().trim())
                        .email(email)
                        .passwordHash(passwordEncoder.encode(request.password()))
                        .role(Role.USER)
                        .enabled(true)
                        .build();

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser() {
        return UserMapper.toCurrentUserResponse(authenticatedUserProvider.getCurrentUser());
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user);
        CurrentUserResponse currentUser = UserMapper.toCurrentUserResponse(user);

        return new AuthResponse(token, "Bearer", jwtProperties.getExpirationMs(), currentUser);
    }
}
