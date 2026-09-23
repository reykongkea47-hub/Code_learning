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
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, title, description, instructor, created_at FROM courses ORDER BY created_at DESC");
        echo json_encode(["success" => true, "courses" => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        error_log('courses GET error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Could not load courses"]);
    }
    exit;
}

if ($method === 'POST') {
    // Only logged-in admins may create courses.
    if (($_SESSION['role'] ?? null) !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Admin access required"]);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $title       = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $instructor  = trim($input['instructor'] ?? '');

    if ($title === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Title is required"]);
        exit;
    }

    try {
        $stmt = $pdo->prepare(
            "INSERT INTO courses (title, description, instructor)
             VALUES (:title, :description, :instructor)
             RETURNING id, title, description, instructor, created_at"
        );
        $stmt->execute([
            'title'       => $title,
            'description' => $description,
            'instructor'  => $instructor,
        ]);

        http_response_code(201);
        echo json_encode(["success" => true, "course" => $stmt->fetch()]);
    } catch (PDOException $e) {
        error_log('courses POST error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Could not create course"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);