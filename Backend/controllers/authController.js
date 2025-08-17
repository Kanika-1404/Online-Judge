const {
  createUser,
  authenticateUser,
  generateToken,
} = require("../services/userService");

const getAdminRegisterForm = (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Registration</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 500px;
                margin: 50px auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
                text-align: center;
                margin-bottom: 30px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #555;
            }
            input[type="text"],
            input[type="email"],
            input[type="password"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-sizing: border-box;
            }
            button {
                width: 100%;
                padding: 12px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            button:hover {
                background-color: #0056b3;
            }
            .error {
                color: red;
                margin-top: 10px;
            }
            .success {
                color: green;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Admin Registration</h1>
            <form id="adminForm" method="POST" action="/register-admin">
                <div class="form-group">
                    <label for="name">Full Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit">Register as Admin</button>
            </form>
            <div id="message" class="message"></div>
        </div>
        <script>
            document.getElementById('adminForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData);
                
                try {
                    const response = await fetch('/register-admin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    
                    if (response.ok) {
                        document.getElementById('message').innerHTML = '<p class="success">' + result.message + '</p>';
                        e.target.reset();
                    } else {
                        document.getElementById('message').innerHTML = '<p class="error">' + (result.error || 'Registration failed') + '</p>';
                    }
                } catch (error) {
                    document.getElementById('message').innerHTML = '<p class="error">Network error. Please try again.</p>';
                }
            });
        </script>
    </body>
    </html>
  `);
};

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(name && email && password)) {
      return res.status(400).json({ error: "Please fill all info." });
    }

    const user = await createUser(name, email, password, "admin");
    const token = generateToken(user);
    user.password = undefined;

    res.status(200).json({ message: "Admin registered successfully.", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(name && email && password)) {
      return res.status(400).send("Please fill all info.");
    }

    const user = await createUser(name, email, password);
    const token = generateToken(user);
    user.password = undefined;

    res
      .status(200)
      .json({ message: "You have successfully registered.", user });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).send("Please provide email and password.");
    }

    const user = await authenticateUser(email, password);
    const token = generateToken(user);
    user.password = undefined;

    res.status(200).json({
      message: "Login successful.",
      user,
      token,
      role: user.role,
      redirectUrl: user.role === "admin" ? "/admin-dashboard" : "/dashboard",
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getAdminRegisterForm,
  registerAdmin,
  registerUser,
  login,
};
