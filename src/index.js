import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { v4 as uuid } from "uuid";

const app = express();
const server = http.createServer(app);
const origin = process.env.CLIENT_ORIGIN || "*";

app.use(cors({ origin }));
app.use(express.json());

/** Demo token issuer — replace with real auth in production apps */
app.post("/api/token", (req, res) => {
  const displayName = String(req.body.displayName || "").trim();
  if (displayName.length < 2) {
    return res.status(400).json({ error: "displayName required" });
  }
  const token = jwt.sign({ name: displayName }, process.env.JWT_SECRET, {
    subject: uuid(),
    expiresIn: "12h",
  });
  res.json({ token, displayName });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const io = new Server(server, {
  cors: { origin },
});

/** roomId -> Map(socketId, displayName) */
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId);
}

function broadcastPresence(roomId) {
  const users = [...getRoom(roomId).values()];
  io.to(roomId).emit("presence", { roomId, users });
}

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.userId = payload.sub;
    socket.data.name = payload.name;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomId, displayName }) => {
    if (!roomId) return;
    const name = displayName || socket.data.name || "Guest";
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = name;
    getRoom(roomId).set(socket.id, name);
    broadcastPresence(roomId);
  });

  socket.on("send_message", ({ roomId, text }) => {
    const clean = String(text || "").trim().slice(0, 1000);
    if (!roomId || !clean) return;
    io.to(roomId).emit("message", {
      id: uuid(),
      roomId,
      user: socket.data.name,
      text: clean,
      at: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    getRoom(roomId).delete(socket.id);
    broadcastPresence(roomId);
  });
});

const port = process.env.PORT || 5050;
server.listen(port, () => {
  console.log(`Realtime chat API on http://localhost:${port}`);
});
