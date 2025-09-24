const express = require('express');
const router = express.Router(); // Define the router

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const usersFilePath = path.join(__dirname, 'users.json'); // Ensure correct path to users.json

// Login route for admin access
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const data = await fs.promises.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);

    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    if (user.role === 'admin') {
      return res.status(200).json({ success: true, role: 'admin' });
    } else {
      return res.status(400).json({ success: false, message: 'You do not have admin privileges' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Export the router to be used in other files
module.exports = router;

