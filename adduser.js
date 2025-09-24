// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {  // Make sure this matches the backend route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),  // Send email and password to the backend
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/home.html'; // Redirect to the homepage or dashboard
    } else {
      document.getElementById('feedbackMessage').textContent = data.message || 'Invalid email or password.';
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById('feedbackMessage').textContent = 'Error logging in.';
  }
});

// Handle registration form submission
document.getElementById('addUserForm').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  try {
    const response = await fetch('http://localhost:3000/add-user', {  // Make sure this matches the backend route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),  // Send email and password to the backend
    });

    const data = await response.json();

    document.getElementById('feedbackMessage').textContent = data.message || 'User added successfully.';
  } catch (error) {
    console.error('Add user error:', error);
    document.getElementById('feedbackMessage').textContent = 'Error adding user.';
  }
});
