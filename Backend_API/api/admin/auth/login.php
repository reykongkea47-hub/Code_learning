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
    'http://127.0.0.1:8000',
    'http://localhost:8000'
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

require_once __DIR__ . '/../../../config/database.php';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}

$rawInput = file_get_contents('php://input');

$input = json_decode($rawInput, true);

if (!is_array($input)) {
    $input = $_POST;
}

$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    respond(400, [
        'success' => false,
        'message' => 'Email and password are required'
    ]);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, [
        'success' => false,
        'message' => 'Invalid email format'
    ]);
}

try {
    $sql = '
        SELECT
            id,
            name,
            email,
            password_hash,
            role
        FROM users
        WHERE LOWER(email) = :email
        LIMIT 1
    ';

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':email' => $email
    ]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        respond(401, [
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
    }

    if (empty($user['password_hash'])) {
        respond(401, [
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
    }

    if (!password_verify($password, $user['password_hash'])) {
        respond(401, [
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
    }

    if (strtolower((string)$user['role']) !== 'admin') {
        respond(403, [
            'success' => false,
            'message' => 'This account does not have admin access'
        ]);
    }

    session_regenerate_id(true);

    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];

    unset($user['password_hash']);

    respond(200, [
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ]
    ]);

} catch (PDOException $e) {
    error_log('Admin login error: ' . $e->getMessage());

    respond(500, [
        'success' => false,
        'message' => 'Database error'
    ]);
}
