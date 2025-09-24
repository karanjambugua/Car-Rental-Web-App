// Function to fetch available cars from the server and populate the dropdown
async function fetchCarNames() {
    try {
        const response = await fetch('/api/cars');  // Fetch available cars from the API
        const cars = await response.json();
        
        const carSelect = document.getElementById('carNumberPlate');
        
        // Clear existing options
        carSelect.innerHTML = '<option value="">Select a car</option>';
        
        // Populate the dropdown list with car names
        cars.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;  // The car's number plate or ID
            option.textContent = car.carName;  // Display the car name in the dropdown
            carSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching car data:', error);
    }
}

// Call fetchCarNames on page load to populate the dropdown
window.onload = function() {
    fetchCarNames();  // Populate the dropdown with available cars
};

