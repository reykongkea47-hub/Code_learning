<?php

declare(strict_types=1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'success' => false,
        'message' => 'Method not allowed',
    ]);
}

require_once __DIR__ . '/../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$name     = trim($input['name'] ?? '');
$email    = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if ($name === '' || $email === '' || $password === '') {
    respond(400, [
        'success' => false,
        'message' => 'Name, email and password are required',
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, [
        'success' => false,
        'message' => 'Invalid email address',
    ]);
}

if (strlen($password) < 8) {
    respond(400, [
        'success' => false,
        'message' => 'Password must be at least 8 characters',
    ]);
}

try {
    $check = $pdo->prepare(
        'SELECT id FROM users WHERE email = :email'
    );

    $check->execute([
        'email' => $email,
    ]);

    if ($check->fetch()) {
        respond(409, [
            'success' => false,
            'message' => 'An account with this email already exists',
        ]);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare(
        "INSERT INTO users (name, email, password_hash, role)
         VALUES (:name, :email, :hash, 'student')
         RETURNING id, name, email, role, created_at"
    );

    $stmt->execute([
        'name'  => $name,
        'email' => $email,
        'hash'  => $hash,
    ]);

    $user = $stmt->fetch();

    respond(201, [
        'success' => true,
        'message' => 'Account created',
        'user'    => $user,
    ]);

} catch (PDOException $e) {
    error_log('register.php error: ' . $e->getMessage());

    respond(500, [
        'success' => false,
        'message' => 'Something went wrong, please try again',
    ]);
}