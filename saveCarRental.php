<?php
// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Get the form data
    $carName = $_POST['carName'];
    $carDescription = $_POST['carDescription'];
    $price = $_POST['price'];
    $currency = $_POST['currency'];

    // Initialize response array
    $response = ['status' => 'error', 'message' => ''];

    // Handle the image upload
    if (isset($_FILES['carImage']) && $_FILES['carImage']['error'] === UPLOAD_ERR_OK) {
        // Set the target directory for the image
        $targetDir = 'images/';  // Directory where the image will be stored
        $imageName = basename($_FILES['carImage']['name']);
        $targetFile = $targetDir . $imageName;
        $imageFileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));

        // Validate image file (only allow jpg, jpeg, png)
        $validImageTypes = ['jpg', 'jpeg', 'png'];
        if (in_array($imageFileType, $validImageTypes)) {
            // Move the uploaded file to the images folder
            if (move_uploaded_file($_FILES['carImage']['tmp_name'], $targetFile)) {
                // Successfully uploaded the image, now return success response
                $response['status'] = 'success';
                $response['message'] = 'Car added successfully!';
                $response['data'] = [
                    'carName' => $carName,
                    'carImage' => $targetFile,  // The image path to store
                    'carDescription' => $carDescription,
                    'price' => $price,
                    'currency' => $currency
                ];

                // Read current data from the JSON file
                $dataFile = 'data.json';
                $data = json_decode(file_get_contents($dataFile), true);

                // Generate a unique ID for the new car
                $newCarId = count($data['cars']) + 1;

                // Create the new car entry with the image path
                $newCar = [
                    "id" => $newCarId,
                    "carName" => $carName,
                    "carImage" => $targetFile,  // Store the image path
                    "carDescription" => $carDescription,
                    "price" => $price,
                    "currency" => $currency,
                    "status" => "Available",  // New car is available by default
                    "category" => "Sedan",    // You can modify this to support dynamic categories
                    "availability" => true
                ];

                // Add the new car to the array
                $data['cars'][] = $newCar;

                // Save the updated data back to the JSON file
                file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

            } else {
                $response['message'] = 'Error uploading your file.';
            }
        } else {
            $response['message'] = 'Invalid image type. Only JPG, JPEG, PNG files are allowed.';
        }
    } else {
        $response['message'] = 'No image uploaded or there was an error uploading the image.';
    }

    // Send response as JSON
    header('Content-Type: application/json');
    echo json_encode($response);

    exit;  // Ensure no further processing happens after sending response
}
?>
