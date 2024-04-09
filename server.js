const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

//import routes
const authRoutes = require("./routes/authroutes");
const userRoutes = require("./routes/user");
const messageRoutes = require("./routes/message");

//db connect
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

const app = express();
const http = require("http").createServer(app);

//middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", messageRoutes);

//create an io server and allow for CORS from http:?//localhost:3000 with GET, DELETE and POST methods
const io = new Server(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE"],
  },
});

//listen when client connects via socket.io-client
io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });
  //sends message to all users on the server
  // socket.emit("receive_message", "server");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const port = process.env.PORT || 8000;

http.listen(port, () => console.log(`Server connected to port: ${port}`));
