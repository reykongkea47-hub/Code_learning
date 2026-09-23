<?php

declare(strict_types=1);

session_start();

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

require_once __DIR__ . '/../../config/database.php';

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

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email    = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    respond(400, [
        'success' => false,
        'message' => 'Email and password are required',
    ]);
}

try {
    $stmt = $pdo->prepare(
        'SELECT id, name, email, password_hash, role
         FROM users
         WHERE email = :email'
    );

    $stmt->execute([
        'email' => $email,
    ]);

    $user = $stmt->fetch();

    if (
        !$user ||
        !password_verify($password, $user['password_hash'])
    ) {
        respond(401, [
            'success' => false,
            'message' => 'Invalid email or password',
        ]);
    }

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];

    unset($user['password_hash']);

    respond(200, [
        'success' => true,
        'message' => 'Login successful',
        'user'    => $user,
    ]);

} catch (PDOException $e) {
    error_log('login.php error: ' . $e->getMessage());

    respond(500, [
        'success' => false,
        'message' => 'Something went wrong, please try again',
    ]);
}