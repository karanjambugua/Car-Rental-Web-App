const fs = require('fs');
const bcrypt = require('bcrypt');
const filePath = './users.json'; // Path to your users.json

// Hash password before storing
const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;  // Rethrow to handle it properly elsewhere
  }
};

// Function to register a new user with a hashed password
async function registerUser(email, password) {
  try {
    const hashedPassword = await hashPassword(password);  // Hash the password
    const newUser = { email, password: hashedPassword };  // Store the new user with the hashed password

    // Read the existing users
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      let users = JSON.parse(data);  // Parse existing users
      users.push(newUser);  // Add the new user to the list

      // Write the updated users data back to the file
      fs.writeFile(filePath, JSON.stringify(users, null, 2), (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("New user successfully added with hashed password.");
        }
      });
    });
  } catch (error) {
    console.error('Error registering user:', error);
  }
}

// Call the function to register a new user (for example)
registerUser("newuser@example.com", "newpassword123");
