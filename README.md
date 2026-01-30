🚀 YooChat — Real-Time Social Media & Communication Platform

A modern, full-stack real-time social media application built for scalability, performance, and future-ready communication (chat, voice, and video).

🌟 Overview

YooChat is a real-time social media and messaging platform that allows users to communicate instantly through one-to-one and group chats, share media, manage profiles, and stay connected through live presence updates.

The architecture is designed with scalability and extensibility in mind, making it easy to add voice and video calling using WebRTC in future iterations.

This project demonstrates:

Real-time systems

Full-stack engineering

Clean backend architecture

Production-ready patterns

✨ Key Features
✅ Core Features

🔐 User authentication (JWT-based)

👤 User profiles & account management

💬 Real-time 1-to-1 messaging

👥 Group chats

🟢 Online / offline presence

📎 Image & file sharing

🔔 Real-time notifications

⚡ WebSocket-based communication (Socket.IO)

🗂 Modular backend & frontend structure

🚧 Planned / Future Features

🔊 Voice calling (WebRTC)

🎥 Video calling (WebRTC)

📺 Screen sharing

📱 Push notifications

🧠 Message encryption enhancements

🛠 Tech Stack
Frontend

React

Vite

SCSS

Socket.IO Client

Backend

Node.js

Express.js

Socket.IO

MongoDB (Mongoose)

JWT Authentication

Multer (file uploads)

Nodemailer (email services)

🧩 Project Structure
YooChat/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── multer/
│   ├── mail/
│   ├── app.js
│   └── package.json
│
└── README.md

⚙️ Prerequisites

Make sure you have the following installed:

Node.js (v18+ recommended)

MongoDB (local or cloud – MongoDB Atlas)

npm or yarn

🔐 Environment Variables

Create a .env file inside the server folder.

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password


⚠️ Never commit .env files to GitHub.

🧪 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/Yoo-Chat-social-media.git
cd Yoo-Chat-social-media

2️⃣ Install Backend Dependencies
cd server
npm install

3️⃣ Install Frontend Dependencies
cd ../client
npm install

4️⃣ Run the Application
Start Backend
cd server
npm run dev

Start Frontend
cd client
npm run dev


Frontend will run on:

http://localhost:5173


Backend will run on:

http://localhost:5000

🔄 Real-Time Architecture

Socket.IO handles real-time messaging & presence

JWT is used to authenticate socket connections

Backend emits and listens to events for:

Messages

User status

Group updates

This setup is WebRTC-ready for future voice/video calling.

🔮 Voice & Video Calling (Design Ready)

The system is designed to support:

WebRTC peer connections

Socket.IO signaling

STUN/TURN servers

Implementation planned without major architectural changes.

🧑‍💻 Developer Notes

node_modules are intentionally excluded

Project follows clean separation of concerns

Easily deployable to cloud platforms (Render, Railway, AWS, etc.)

🚀 Deployment (Optional)

You can deploy:

Frontend → Vercel / Netlify

Backend → Render / Railway / AWS

Database → MongoDB Atlas

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch

Submit a pull request

📄 License

This project is licensed under the MIT License.

⭐ Final Words

YooChat is built as a real-world, production-style application, not just a demo.
It showcases real-time engineering, scalability thinking, and modern full-stack development.

If you like the project, consider starring ⭐ the repository.
