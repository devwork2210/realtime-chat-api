# Realtime Chat API

Socket.io chat backend with rooms, presence, and JWT-gated connections.

## Stack
Node.js · Express · Socket.io · JWT · in-memory store (swap for Redis in production)

## Run
```bash
cp .env.example .env
npm install
npm run dev
```

## Events
| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | client → server | `{ roomId, displayName }` |
| `send_message` | client → server | `{ roomId, text }` |
| `message` | server → room | `{ id, roomId, user, text, at }` |
| `presence` | server → room | `{ roomId, users: string[] }` |

## Why recruiters care
Shows real-time architecture: auth handshake, room scoping, and event contracts—skills used in messaging products.
