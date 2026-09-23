
<?php

// PostgreSQL Database Connection

$host = "localhost";
$port = "5432";
$dbname = "code_learning";
$user = "postgres";
$password = "NewPassword123";

try {

    // Create PDO connection
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $user,
        $password
    );

    // Throw exception when database error occurs
    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    // Return database rows as associative arrays
    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );

} catch (PDOException $e) {

    http_response_code(500);

    header("Content-Type: application/json");

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);

    // Save real error in PHP server log
    error_log(
        "Database connection failed: " . $e->getMessage()
    );

    exit;
}