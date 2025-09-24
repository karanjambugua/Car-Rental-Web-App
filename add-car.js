

const path = require('path');
const express = require('express');
const multer = require('multer');
const app = express();
const fs =  require('fs-extra'); 
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});
const cors = require('cors');
app.use(cors());

// Required files
const customerDataRoutes = require('./customer-data.js');  // Import customer data routes
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());  // Enable CORS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use the customer data routes from `customer-data.js`
app.use('/customer', customerDataRoutes);  // Mount customer-related routes
// Setup car management routes (as it was before)
app.post('/add-car', async (req, res) => {
  // Handling car addition logic here (already defined in your existing add-car.js)
});

// Paths
const apiUrl = process.env.API_URL || 'http://localhost:3000';
const usersFilePath = path.join(__dirname, 'users.json'); // Path to the users JSON file
const dataFilePath = path.join(__dirname, 'data.json');
const imageFolder = path.join(__dirname, 'images');
// Import user routes (we'll create this next)
const userRoutes = require('./userRoutes');
app.use('/api', userRoutes);
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
// API endpoint to fetch available cars for the dropdown
app.get('/api/cars', async (req, res) => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    const parsedData = JSON.parse(data);

    // Filter out cars that are available for rent
    const availableCars = parsedData.cars.filter(car => car.status === 'Available');

    // Send available cars as JSON
    res.json(availableCars);
  } catch (error) {
    res.status(500).send('Error fetching car data');
  }
});

// custome.json 
app.get('/api/customers', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'customer-data.json'), 'utf8');
    const parsedData = JSON.parse(data);
    res.json(parsedData); // Send the customer data as a response
  } catch (error) {
    console.error('Error fetching customer data:', error);
    res.status(500).send('Error fetching customer data');
  }
});

//Images saved for customers // Ensure to import fs-extra for directory handling

// Ensure 'customers' directory exists
const customersDir = path.join(__dirname, 'images', 'customers');
fs.ensureDirSync(customersDir);  // This will create the 'customers' folder if it doesn't exist

// Multer storage config
const customerImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, customersDir);  // Save files to the 'customers' folder
  },
  filename: function (req, file, cb) {
    const customerId = req.body.customerId;  // Customer ID from the form input
    const fileExtension = file.mimetype.split('/')[1];
    cb(null, `${customerId}-${Date.now()}.${fileExtension}`);  // Save with customer ID and timestamp
  }
});

const uploadCustomerImages = multer({ storage: customerImageStorage });

app.post('/add-customer', uploadCustomerImages.fields([
  { name: 'customerImage' },
  { name: 'agreementImage' }
]), async (req, res) => {
  const { customerId, customerName, rentalDays, rentalStartDate, rentalEndDate } = req.body;

  const customerImage = req.files['customerImage']?.[0]?.filename;
  const agreementImage = req.files['agreementImage']?.[0]?.filename;

  const newCustomer = {
    id: customerId,
    carNumberPlate: req.body.carNumberPlate,
    customerName: customerName,
    rentalDays: rentalDays,
    customerImage: `images/customers/${customerImage}`,
    agreementImage: `images/customers/${agreementImage}`,
    rentalStartDate: rentalStartDate,
    rentalEndDate: rentalEndDate
  };

  try {
    const jsonData = await fs.readFile(path.join(__dirname, 'customer-data.json'), 'utf8');
    let data;
    try {
      data = JSON.parse(jsonData);
    } catch (parseErr) {
      return res.status(500).send("Error parsing customer data");
    }

    // Add new customer to the data
    data.customers.push(newCustomer);

    // Save the updated customer data back to the file
    await fs.writeFile(path.join(__dirname, 'customer-data.json'), JSON.stringify(data, null, 2));

    res.status(200).send("Customer added successfully!");
  } catch (err) {
    console.error('Error reading or writing customer data:', err);
    res.status(500).send("Failed to update customer data");
  }
});
// UPDATE CAR AVAILABILITU AND CLEAR CUSTOMERS
// API to update car availability
app.put('/api/cars/:id', async (req, res) => {
  try {
    const carId = req.params.id;
    const updatedCar = req.body;

    const data = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
    const parsedData = JSON.parse(data);

    const carIndex = parsedData.cars.findIndex(car => car.id === carId);
    if (carIndex === -1) {
      return res.status(404).send('Car not found');
    }

    parsedData.cars[carIndex] = updatedCar;

    await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(parsedData, null, 2));

    res.status(200).send('Car availability updated');
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).send('Error updating car');
  }
});

// API to update customer status
app.put('/api/customers/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const updatedCustomer = req.body;

    const data = await fs.readFile(path.join(__dirname, 'customer-data.json'), 'utf8');
    const parsedData = JSON.parse(data);

    const customerIndex = parsedData.customers.findIndex(customer => customer.id === customerId);
    if (customerIndex === -1) {
      return res.status(404).send('Customer not found');
    }

    parsedData.customers[customerIndex] = updatedCustomer;

    await fs.writeFile(path.join(__dirname, 'customer-data.json'), JSON.stringify(parsedData, null, 2));

    res.status(200).send('Customer status updated');
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).send('Error updating customer');
  }
});

// API to clear rented cars
app.post('/api/clear-cars', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'customer-data.json'), 'utf8');
        const parsedData = JSON.parse(data);

        const { carIds } = req.body;

        // Update the customer data by clearing the rented cars
        parsedData.customers = parsedData.customers.filter(customer => !carIds.includes(customer.id.toString()));

        // Save the updated data back to the JSON file
        await fs.writeFile(path.join(__dirname, 'customer-data.json'), JSON.stringify(parsedData, null, 2));

        res.json({ message: 'Rented cars cleared successfully.' });
    } catch (error) {
        console.error('Error clearing rented cars:', error);
        res.status(500).send('Error clearing rented cars');
    }
});
// Define filePath for users.json
const filePath = path.join(__dirname, 'users.json');

// Middleware to parse JSON request body
app.use(express.json());

// **1. Ensure First Admin Creation (if needed)**
const createFirstAdminIfNeeded = async () => {
  try {
    // Check if the users.json file exists
    if (!fs.existsSync(filePath)) {
      console.log("users.json not found, creating file...");
      // If file doesn't exist, create an empty array
      await fs.promises.writeFile(filePath, JSON.stringify([]));
    }

    const data = await fs.promises.readFile(filePath, 'utf8');
    const users = JSON.parse(data);

    // Check if there is already an admin in the users list
    const adminExists = users.some(user => user.role === 'admin');

    if (!adminExists) {
      console.log("Admin not found, creating admin...");

      const email = process.env.ADMIN_EMAIL;  // Get admin email from environment variable
      const password = process.env.ADMIN_PASSWORD;  // Get admin password from environment variable
      const fullName = 'Admin User';
      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = {
        id: 1,
        fullName,
        email,
        password: hashedPassword,
        role: 'admin',
      };

      users.push(newAdmin); // Add the new admin to the array

      // Write the updated user data back to the file
      await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2));

      console.log("Admin account created successfully!");
    } else {
      console.log("Admin already exists, skipping creation.");
    }
  } catch (error) {
    console.error('Error reading or creating admin:', error);
  }
};

// Call this function to ensure the admin account is created at startup
createFirstAdminIfNeeded();

// **2. User Login Route (POST to /login)**
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  try {
    // Read users data from users.json
    const data = await fs.promises.readFile(filePath, 'utf8');
    const users = JSON.parse(data);

    // Find the user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return res.status(200).json({ success: true, message: "Login successful." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// **3. User Registration Route (POST to /add-user)**
app.post('/add-user', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    // Read the current users data from users.json
    const data = await fs.promises.readFile(filePath, 'utf8');
    const users = JSON.parse(data);

    // Check if the email already exists in the users data
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user object
    const newUser = { email, password: hashedPassword };
    users.push(newUser);  // Add the new user to the users list

    // Write the updated user data back to the file
    await fs.promises.writeFile(filePath, JSON.stringify(users, null, 2));

    res.status(200).json({ success: true, message: 'User added successfully.' });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ success: false, message: 'Error saving users data.' });
  }
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});