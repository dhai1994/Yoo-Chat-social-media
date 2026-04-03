import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import userRoute from "./routes/user.js";
import socketRoute from "./routes/socket.js";
import { connectDB } from "./db/config.js";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173",
  "https://yoo-chat-social-media.vercel.app",
  "https://yoo-chat-social-media-f0dcpo8fo.vercel.app",
];

const corsConfig = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.options("*", cors(corsConfig));
app.use(express.json({ limit: "50mb" }));
app.use(cors(corsConfig));
app.use(cookieParser());

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsConfig,
  cookie: true,
});

// MUST be after io is created
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res || {}, next);
});

app.use(express.static("dist"));
app.use("/files", express.static("files"));
app.use("/api/user", userRoute);

app.get("/api", (req, res) => {
  res.send("Api V1");
});

socketRoute(app, io);

app.get("/*", (req, res) => {
  res.sendFile(path.join(path.resolve(`${path.dirname("")}/dist/index.html`)));
});

server.listen(port, () => {
  connectDB((done, err) => {
    if (done) console.log("DB Connected");
    else console.log(`DB Connect Failed : ${err}`);
  });
  console.log(`Server Started Port : ${port}`);
});
