document.addEventListener('DOMContentLoaded', () => {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const carList = document.getElementById('carList');

      data.cars.forEach(car => {
        const isAvailable = car.availability;

        // Graceful fallback
        const images = car.images || {};
        const features = car.features || {};
        const defaultImage = images.front || 'images/default.jpg';

        const carCard = document.createElement('div');
        carCard.className = 'car-card';

        carCard.innerHTML = `
          <img id="car-img-${car.id}" src="${defaultImage}" alt="${car.carName}">
          <h3>${car.carName}</h3>
          <p class="price">From <span class="highlight">${car.currency} ${car.price}/day</span></p>
          <div class="features">
            <div>${features.seats || 'N/A'}</div>
            <div>${features.transmission || 'N/A'}</div>
            <div>${features.ageRequirement || 'N/A'}</div>
            <div>${features.mileage || 'N/A'}</div>
          </div>
          <div class="image-controls">
            <button onclick="changeImage(${car.id}, '${images.front || 'images/default.jpg'}')">Front</button>
            <button onclick="changeImage(${car.id}, '${images.side || 'images/default.jpg'}')">Side</button>
            <button onclick="changeImage(${car.id}, '${images.back || 'images/default.jpg'}')">Back</button>
          </div>
          <button class="book-now" onclick="bookCar(${car.id}, '${car.carName}')" ${!isAvailable ? 'disabled' : ''}>
            ${isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
        `;

        carList.appendChild(carCard);
      });
    })
    .catch(error => {
      console.error("Error loading data:", error);
    });
});

// Image switcher
function changeImage(carId, imageUrl) {
  document.getElementById(`car-img-${carId}`).src = imageUrl;
}

function bookCar(carId, carName) {
  document.getElementById('reservationFormSection').style.display = 'block';
  document.getElementById('carId').value = carId;
  document.getElementById('reservationForm').scrollIntoView({ behavior: 'smooth' });
}
