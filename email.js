const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const app = express();

const dataFilePath = path.join(__dirname, 'submissions.json');  // Path to the JSON file that stores form data

// Middleware to parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer setup for email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',  // Replace with your email
    pass: 'your-email-password',   // Replace with your email password or app-specific password
  }
});

// POST endpoint to handle form submission and store data
app.post('/submit-booking', async (req, res) => {
  const formData = req.body;

  // Create a new form submission object
  const formSubmission = {
    pickupLocation: formData.pickupLocation,
    pickupDate: formData.pickupDate,
    pickupTime: formData.pickupTime,
    returnDate: formData.returnDate,
    returnTime: formData.returnTime,
    differentReturn: formData.differentReturn || false,  // If no checkbox is checked, set to false
  };

  // Store form data in a JSON file (submissions.json)
  try {
    const jsonData = await fs.promises.readFile(dataFilePath, 'utf8');
    let data = JSON.parse(jsonData);

    // Add the new form submission to the data
    data.push(formSubmission);

    // Write the updated data back to the file
    await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2));

    // Send success response back
    res.status(200).json({ message: 'Form submission successful' });
  } catch (err) {
    console.error('Error storing data:', err);
    res.status(500).send("Error storing form data.");
  }

  // Send email notification using Nodemailer
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'florayola7@gmail.com',  // Admin email
    subject: 'New Booking Request',
    text: `
      You have received a new booking request:
      Pickup Location: ${formSubmission.pickupLocation}
      Pickup Date: ${formSubmission.pickupDate}
      Pickup Time: ${formSubmission.pickupTime}
      Return Date: ${formSubmission.returnDate}
      Return Time: ${formSubmission.returnTime}
      Different Return Location: ${formSubmission.differentReturn ? 'Yes' : 'No'}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send('Error sending email');
    }
    console.log('Email sent: ' + info.response);
  });
});

// Endpoint to view saved submissions (Admin page)
app.get('/admin/enquiries', (req, res) => {
  fs.readFile(dataFilePath, (err, data) => {
    if (err) {
      return res.status(500).send('Error reading submission data');
    }
    const submissions = JSON.parse(data);
    res.json(submissions);  // Return the data to be displayed in the admin panel
  });
});

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
