<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the car index from the form
    $carIndex = $_POST['carIndex'];

    // Read the car data from the JSON file
    $carData = file_get_contents('carRentals.json');
    $carArray = json_decode($carData, true);

    // Remove the car by index
    unset($carArray[$carIndex]);

    // Reindex the array after deletion
    $carArray = array_values($carArray);

    // Save the updated car data back to the file
    file_put_contents('carRentals.json', json_encode($carArray, JSON_PRETTY_PRINT));

    echo "Car deleted successfully!";
    header("Location: manage-cars.html"); // Redirect back to manage-cars page after deletion
}
?>
