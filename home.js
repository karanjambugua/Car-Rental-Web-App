// script.js
window.onload = function() {
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const time = today.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    document.getElementById("pickupDate").value = date;
    document.getElementById("returnDate").value = date;
    document.getElementById("pickupTime").value = time;
    document.getElementById("returnTime").value = time;
  };

  // Show/Hide return location input based on checkbox
  document.getElementById("returnLocationToggle").addEventListener('change', function() {
    const returnLocationField = document.getElementById("returnLocationInput");
    if (this.checked) {
      returnLocationField.style.display = "block"; // Show input field
    } else {
      returnLocationField.style.display = "none"; // Hide input field
    }
  });

  // Handle form submission and send data using Fetch API
  document.querySelector(".booking-form").addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent default form submission behavior

    // Create a FormData object from the form to easily collect data
    const formData = new FormData(this);

    // Convert FormData to a JSON object
    const data = {
      pickupLocation: formData.get('pickupLocation'),
      pickupDate: formData.get('pickupDate'),
      pickupTime: formData.get('pickupTime'),
      returnDate: formData.get('returnDate'),
      returnTime: formData.get('returnTime'),
      returnLocation: formData.get('returnLocation') || '', // If no return location is provided
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    // Send the form data to the server using fetch
    fetch('http://localhost:3000/submit-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(responseData => {
      alert(responseData.message); // Show success message
    })
    .catch(error => {
      alert('An error occurred while submitting your booking.');
      console.error(error); // Log error for debugging
    });
  });
