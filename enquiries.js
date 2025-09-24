document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/customers')  // Fetch data from the new API route
    .then(response => response.json())
    .then(data => {
      const enquiryList = document.getElementById('enquiryList');

      data.customers.forEach(customer => {
        const { customerName, carNumberPlate, rentalDays, customerImage, agreementImage, rentalStartDate, rentalEndDate } = customer;

        const enquiryCard = document.createElement('div');
        enquiryCard.className = 'enquiry-card';

        enquiryCard.innerHTML = `
          <img class="customer-img" src="${customerImage}" alt="${customerName}">
          <h3>${customerName}</h3>
          <p><strong>Car:</strong> ${carNumberPlate}</p>
          <p><strong>Rental Period:</strong> ${rentalStartDate} to ${rentalEndDate}</p>
          <p><strong>Rental Days:</strong> ${rentalDays}</p>
          <div class="images">
            <img class="agreement-img" src="${agreementImage}" alt="Rental Agreement">
          </div>
        `;

        enquiryList.appendChild(enquiryCard);
      });
    })
    .catch(error => {
      console.error("Error loading customer data:", error);
    });
});

