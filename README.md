💬 Chat Application

A real-time chat application built using React, Node.js, Express.js, MongoDB, and Socket.IO that allows users to communicate instantly.
Users can register, log in, and chat with other users in real time, while sharing text messages, images, files, and emojis.

🚀 Features
👤 User Authentication
Register new users
Login with email and password

💬 Real-Time Messaging
Instant chat using Socket.IO

Send and receive messages without refreshing the page
📎 File Sharing

Send images
Send documents/files
😀 Emoji Support
Send emojis in chat messages
🖼 Profile Picture Upload
Users can upload their profile picture
✔ Message Delivery Status
Shows whether the message is delivered
🕒 Timestamp
Every message shows the date and time

🛠 Tech Stack
Frontend:
React
JavaScript
CSS / Tailwind

Backend:
Node.js
Express.js

Database:
MongoDB

Real-Time Communication:
Socket.IO

⚙ Installation
1️⃣ Clone the Repository
git clone https://github.com/Guruprasadys/Chat_Application.git
cd Chat_Application
2️⃣ Install Backend Dependencies
cd server
npm install

Start backend server:
npm start
3️⃣ Install Frontend Dependencies
cd client
npm install

Run frontend:
npm start
🌐 Environment Variables

Create a .env file in the server folder:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
