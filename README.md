<div align="center">

# Realtime Chat API

**Socket.io** chat service with rooms, presence, and JWT-gated connections.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

</div>

Shows realtime architecture used in messaging products: auth handshake, room scoping, and typed event contracts.

```js
const io = new Server(server, { cors: { origin } });

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  socket.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
});

io.on("connection", (socket) => {
  socket.on("join_room", ({ roomId, displayName }) => {
    socket.join(roomId);
    io.to(roomId).emit("presence", { roomId, users: [...getRoom(roomId).values()] });
  });
});
```

## Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | client → server | `{ roomId, displayName }` |
| `send_message` | client → server | `{ roomId, text }` |
| `message` | server → room | `{ id, roomId, user, text, at }` |
| `presence` | server → room | `{ roomId, users: string[] }` |

## Run

```bash
cp .env.example .env
npm install
npm run dev
```
