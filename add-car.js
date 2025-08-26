

const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const fs =  require('fs-extra'); 
const bodyParser = require('body-parser');


// Paths
const dataFilePath = path.join(__dirname, 'data.json');
const imageFolder = path.join(__dirname, 'images');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


app.post('/add-car', upload.fields([
  { name: 'frontImage' },
  { name: 'sideImage' },
  { name: 'backImage' }
]), async (req, res) => {
  const frontImg = req.files['frontImage']?.[0]?.filename;
  const sideImg = req.files['sideImage']?.[0]?.filename;
  const backImg = req.files['backImage']?.[0]?.filename;
  console.log("🔥 Received POST /add-car");
console.log("req.body:", req.body);
console.log("req.files:", req.files);

  const newCar = {
    id: req.body.carId.trim(),
    carName: req.body.carName.trim(),
    images: {
      front: `images/${frontImg}`,
      side: `images/${sideImg}`,
      back: `images/${backImg}`
    },
    carDescription: req.body.carDescription.trim(),
    price: parseFloat(req.body.price),
    currency: req.body.currency,
    status: "Available",
    category: req.body.category,
    availability: true,
    features: {
      seats: req.body.seats.trim(),
      transmission: req.body.transmission.trim(),
      ageRequirement: req.body.ageRequirement.trim(),
      mileage: req.body.mileage.trim()
    }
  };

  try {
    const jsonData = await fs.readFile(dataFilePath, 'utf8');
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (parseErr) {
      return res.status(500).send("Error parsing data.json");
    }

    // Check if the car already exists
    if (data.cars.some(car => car.id === newCar.id)) {
      return res.status(400).send("A car with this number plate already exists.");
    }

    // Add the new car to the array
    data.cars.push(newCar);

    // Write the updated data back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));

    res.status(200).send("Car added successfully!");
  } catch (err) {
    console.error('Error reading or writing file:', err);
    res.status(500).send("Failed to update data.json");
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
const nodemailer = require('nodemailer');

// emails
// Paths
const submissionsFilePath = path.join(__dirname, 'submissions.json'); // File to store submissions

// Setup body parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Setup Nodemailer transporter for email
let transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // use TLS
  auth: {
    user: '93a156001@smtp-brevo.com', // Your Sendinblue email
    pass: 'aH3zQL8AshSyBYgk'          // Your Sendinblue SMTP password
  }
});
// post booking
app.post('/submit-booking', (req, res) => {
  // Handle form submission logic here
  const formData = req.body;
  // Process the form data, send email, save to JSON, etc.
  res.json({ message: 'Form submitted successfully' }); // Respond with JSON
});
// POST route to handle form submission and send email
app.post('/submit-enquiry', (req, res) => {
  const { name, email, phone, pickupLocation, pickupDate, returnDate } = req.body;

  // Email content

  const submissionsFilePath = path.join(__dirname, 'submissions.json'); // File to store form submissions
  const mailOptions = {
    from: '93a156001@smtp-brevo.com',  // Your Sendinblue email address
    to: 'florayola7@gmail.com',        // Your receiving email address
    subject: 'New Car Rental Enquiry',
    text: `
      New Booking Enquiry:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Pickup Location: ${pickupLocation}
      Pickup Date: ${pickupDate}
      Return Date: ${returnDate}
    `
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending email.' });
    }
    console.log('Email sent: ' + info.response);
  });

  // Save form data to submissions.json
  const newSubmission = {
    name: name,
    email: email,
    phone: phone,
    pickupLocation: pickupLocation,
    pickupDate: pickupDate,
    returnDate: returnDate
  };

  // Read the existing submissions file
  fs.readFile(submissionsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading submissions.json');
    }

    let submissions = [];
    try {
      submissions = JSON.parse(data);  // Parse the existing data in submissions.json
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
    }

    // Push the new submission to the array
    submissions.push(newSubmission);

    // Write the updated submissions data back to the file
    fs.writeFile(submissionsFilePath, JSON.stringify(submissions, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error saving submission data:', writeErr);
        return res.status(500).send('Failed to save submission data');
      }
      res.status(200).json({ message: 'Enquiry submitted successfully!' });
    });
  });
});
// Serve the enquiries data to the admin
app.get('/view-enquiries', (req, res) => {
  fs.readFile(submissionsFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading submissions.json');
    }
    const submissions = JSON.parse(data);  // Parse and send the data
    res.json(submissions);  // Return the submissions as a JSON response
  });
});
app.post('/submit-booking', (req, res) => {
  console.log('Form submission received');
  // Handle the form data here
  res.status(200).json({ message: 'Form submitted successfully' });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});