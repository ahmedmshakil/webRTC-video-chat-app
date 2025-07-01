# WebRTC Video Chat Application

A modern video chat application built with Java Spring Boot and WebRTC. The application supports one-on-one video calls, group video conferencing, screen sharing, and in-meeting chat.

## Features

- User authentication with JWT
- One-on-one video calls
- Group video conferencing
- Screen sharing
- Real-time chat messaging
- Mute/unmute audio
- Enable/disable video
- Dynamic room creation
- Responsive video grid layout

## Technologies Used

### Backend
- Java 21
- Spring Boot 3.2.3
- Spring WebSocket
- Spring Security
- MySQL Database
- JWT Authentication

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- WebRTC API
- SockJS
- STOMP WebSocket

## Prerequisites

- Java 21 or higher
- MySQL 8.0 or higher
- Maven
- Node.js and npm (optional, for development)

## Setup

1. Clone the repository:
```bash
https://github.com/ahmedmshakil/webRTC-video-chat-app.git
cd webRTC-video-chat-app
```

2. Configure MySQL:
- Create a MySQL database named `videochat`
- Update `src/main/resources/application.properties` with your MySQL credentials

3. Build the application:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The application will be available at `http://localhost:8080`

## Usage

1. Register a new account or login with existing credentials
2. Enter a room ID to create or join a video chat room
3. Allow camera and microphone access when prompted
4. Use the control buttons to:
   - Toggle video on/off
   - Toggle audio mute/unmute
   - Share your screen
   - Send chat messages
5. Share the room ID with others to invite them to join
6. Click "Leave Room" to exit the video chat

<!-- ## Security

- All API endpoints are secured with JWT authentication
- WebSocket connections are authenticated
- Passwords are encrypted using BCrypt
- HTTPS is recommended for production deployment -->


## Screenshots
null


## Author

👤 **Shakil Ahmed**

* LinkedIn: [@ahmedmshakil](https://www.linkedin.com/in/ahmedmshakil/)
* GitHub: [@ahmedmshakil](https://github.com/ahmedmshakil)