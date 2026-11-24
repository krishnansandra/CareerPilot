
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin credentials are missing from environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const admin = await User.create({
      name: "CareerPilot Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
    console.log("Email:", admin.email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
