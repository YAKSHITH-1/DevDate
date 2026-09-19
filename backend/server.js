import http from "http";
import { PORT } from "./src/config/env.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initSocket } from "./src/sockets/index.js";

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(` DevDate Server & Socket.IO running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(` Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
