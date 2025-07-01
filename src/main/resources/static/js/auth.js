// DOM Elements
const authContainer = document.getElementById('auth-container');
const videoChatContainer = document.getElementById('video-chat-container');
const loginBox = document.getElementById('login-box');
const registerBox = document.getElementById('register-box');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// Toggle between login and register forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';
});

// Handle Registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        username: document.getElementById('register-username').value,
        email: document.getElementById('register-email').value,
        fullName: document.getElementById('register-fullname').value,
        password: document.getElementById('register-password').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            registerBox.style.display = 'none';
            loginBox.style.display = 'block';
            // Clear the form
            registerForm.reset();
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Registration failed: ' + error.message);
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginData = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };

    try {
        console.log('Attempting login with:', loginData.username); // Debug log
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug log
        
        if (response.ok && data.token) {
            // Store the token
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', loginData.username);
            
            // Show video chat interface
            authContainer.style.display = 'none';
            videoChatContainer.style.display = 'flex';
            
            // Clear the form
            loginForm.reset();
            
            // Initialize WebRTC after successful login
            if (typeof initializeWebRTC === 'function') {
                initializeWebRTC();
            }
        } else {
            alert(data.message || 'Invalid username or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

// Check if user is already logged in
window.addEventListener('load', () => {
    const token = localStorage.getItem('token');
    if (token) {
        authContainer.style.display = 'none';
        videoChatContainer.style.display = 'flex';
        if (typeof initializeWebRTC === 'function') {
            initializeWebRTC();
        }
    }
}); 