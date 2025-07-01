-- Demo user credentials:
-- Username: demo@example.com
-- Password: demo123

-- Note: The password is encrypted using BCrypt
INSERT INTO users (username, email, password, full_name)
SELECT 'demo', 'demo@example.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Demo User'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'demo'
); 