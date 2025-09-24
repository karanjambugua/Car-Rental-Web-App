const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const router = express.Router();  // Use Router for modular route handling

// Paths
const customerDataFilePath = path.join(__dirname, 'customer-data.json');
const imageFolder = path.join(__dirname, 'images');

// Multer setup for image uploads (customer image and agreement image)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imageFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Route to allocate a car to a customer
router.post('/allocate-car', upload.fields([
  { name: 'customerImage' },  // File input for customer image
  { name: 'agreementImage' }  // File input for agreement image
]), async (req, res) => {
  const { carNumberPlate, customerName, rentalDays, phoneNumber } = req.body;
  const customerImage = req.files['customerImage']?.[0]?.filename;
  const agreementImage = req.files['agreementImage']?.[0]?.filename;

  try {
    // Fetch existing customer data
    const jsonData = await fs.readFile(customerDataFilePath, 'utf8');
    const data = JSON.parse(jsonData);

    // Check if a customer already exists with this phone number
    const existingCustomer = data.customers.find(customer => customer.phoneNumber === phoneNumber);
    if (existingCustomer) {
      return res.status(400).send('Customer with this phone number already exists.');
    }

    // Add new customer rental data
    const newCustomerData = {
      id: data.customers.length + 1,  // Auto-increment customer ID
      phoneNumber,  // Save the phone number
      carNumberPlate,
      customerName,
      rentalDays,
      customerImage: `images/${customerImage}`,
      agreementImage: `images/${agreementImage}`,
      rentalStartDate: new Date().toISOString(),
      rentalEndDate: new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000).toISOString()
    };

    // Push new customer data into the existing customers array
    data.customers.push(newCustomerData);

    // Save updated customer data to customer-data.json
    await fs.writeFile(customerDataFilePath, JSON.stringify(data, null, 2));

    res.status(200).send('Car allocated successfully to customer!');
  } catch (error) {
    res.status(500).send('Error allocating car to customer');
  }
});

// Route to get all customer data (rented cars)
router.get('/customers', async (req, res) => {
  try {
    const data = await fs.readFile(customerDataFilePath, 'utf8');
    const parsedData = JSON.parse(data);
    res.json(parsedData.customers);  // Return customer data as JSON
  } catch (error) {
    res.status(500).send('Error fetching customer data');
  }
});

// Export the router to be used in `add-car.js`
module.exports = router;

