require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const cron = require("node-cron");

const { cleanExpiredSessions } = require("./controllers/login.controller");
const { deleteUnverifiedAccounts } = require("./services/cleanup.service");
const app = require("./app");

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    console.log("Cleaning expired sessions...");
    cleanExpiredSessions();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`✓ Server listening on port ${PORT}`);
    });

    cron.schedule("0 * * * *", () => {
      console.log("🕐 Running cleanup job...");
      deleteUnverifiedAccounts();
    });

    console.log("✓ Cleanup job scheduled (runs every hour)");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

startServer();
