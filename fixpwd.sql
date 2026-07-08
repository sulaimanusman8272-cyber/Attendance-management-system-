UPDATE users SET password_hash = '$2a$10$cdawEMvEwhvjMHh.5LJrFOl0KOJcW9lVRdkWu.koiW7pUHWehvlEC' WHERE institution_id = 1;
SELECT email, LEFT(password_hash,20) as hash_preview FROM users;
