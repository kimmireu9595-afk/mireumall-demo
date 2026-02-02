# Shopping Mall Demo Server

Node.js + Express + MongoDB starter in the `sever` folder.

## Setup
1. Install dependencies:
   - `npm install`
2. Create environment variables:
   - `PORT=3000`
   - `MONGODB_URI=mongodb://localhost:27017/shoppingmall_demo`
3. Run:
   - `npm run dev` (nodemon)
   - `npm start` (node)

## Endpoints
- `GET /health` -> `{ "status": "ok" }`
