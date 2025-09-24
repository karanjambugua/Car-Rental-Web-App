document.addEventListener('DOMContentLoaded', () => {
    const clearanceList = document.getElementById('clearanceList');
    const clearCarsBtn = document.getElementById('clearCarsBtn');

    // Fetch the customer data (rented cars) from the server
    fetch('/api/customers')
        .then(response => response.json())
        .then(data => {
            const rentedCars = data.customers.filter(customer => customer.rentalDays > 0); // Filter rented cars
            
            // Display rented cars in the form of checkboxes
            rentedCars.forEach(customer => {
                const carDiv = document.createElement('div');
                carDiv.classList.add('clearance-card');
                carDiv.innerHTML = `
                    <input type="checkbox" id="car-${customer.id}" data-id="${customer.id}" />
                    <label for="car-${customer.id}">
                        <img src="${customer.customerImage}" alt="${customer.customerName}" />
                        <h3>${customer.customerName}</h3>
                        <p>Car: ${customer.carNumberPlate}</p>
                        <p>Rental Days: ${customer.rentalDays}</p>
                        <p>Start: ${customer.rentalStartDate}</p>
                        <p>End: ${customer.rentalEndDate}</p>
                        <img src="${customer.agreementImage}" alt="Agreement Image" />
                    </label>
                `;
                clearanceList.appendChild(carDiv);
            });
        })
        .catch(error => {
            console.error('Error loading customer data:', error);
        });

    // Handle the clearance button click
    clearCarsBtn.addEventListener('click', () => {
        const selectedCars = Array.from(document.querySelectorAll('.clearance-card input:checked')).map(checkbox => checkbox.dataset.id);
        
        if (selectedCars.length > 0) {
            // Perform the "clear" action (you can define this action)
            fetch('/api/clear-cars', {
                method: 'POST',
                body: JSON.stringify({ carIds: selectedCars }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                alert('Selected cars cleared successfully!');
                // You can add functionality to remove the cars from the page or update the page
                selectedCars.forEach(id => {
                    document.getElementById(`car-${id}`).disabled = true;
                });
            })
            .catch(error => {
                console.error('Error clearing cars:', error);
            });
        } else {
            alert('Please select at least one car to clear.');
        }
    });
});

