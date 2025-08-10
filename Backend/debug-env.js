#!/usr/bin/env node

// Debug script to check environment variables
console.log("=== Environment Variables Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URL:", process.env.MONGO_URL);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set (hidden)" : "Not set");
console.log("All environment variables:");
console.log(JSON.stringify(process.env, null, 2));
