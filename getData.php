<?php
// Set header for JSON response
header('Content-Type: application/json');

// Check if the file exists
$dataFile = 'data.json';
if (file_exists($dataFile)) {
    // Read the contents of the data.json file
    $jsonData = file_get_contents($dataFile);
    echo $jsonData; // Send the data to the frontend as JSON
} else {
    echo json_encode(["error" => "Data file not found."]);
}
?>
