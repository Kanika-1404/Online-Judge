const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();

// Import the backend routes
const backendRouter = require('./Backend/index');

// Use the backend router
app.use('/', backendRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
