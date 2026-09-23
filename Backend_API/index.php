<?php
header("Content-Type: application/json");

echo json_encode([
    "success" => true,
    "message" => "Welcome to CodeLearning Backend API",
    "version" => "1.0.0",
    "endpoints" => [
        "POST /api/auth/register.php",
        "POST /api/auth/login.php",
        "POST /api/auth/logout.php",
        "GET  /api/courses/index.php",
        "POST /api/courses/index.php (admin only)",
    ],
]);
