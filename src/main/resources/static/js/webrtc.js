let localStream;
let peerConnections = {};
let stompClient;
let currentRoom;
let localVideo;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Initialize WebRTC
async function initializeWebRTC() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        // Create local video element
        const videoGrid = document.getElementById('video-grid');
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        
        localVideo = document.createElement('video');
        localVideo.muted = true;
        localVideo.srcObject = localStream;
        localVideo.addEventListener('loadedmetadata', () => {
            localVideo.play();
        });
        
        videoContainer.appendChild(localVideo);
        videoGrid.appendChild(videoContainer);
        
        // Initialize WebSocket connection
        connectWebSocket();
        
        // Setup control buttons
        setupControls();
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Error accessing camera/microphone');
    }
}

// WebSocket Connection
function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, () => {
        console.log('WebSocket Connected');
        
        // Subscribe to room events
        stompClient.subscribe('/topic/room', (message) => {
            const data = JSON.parse(message.body);
            handleRoomMessage(data);
        });
    });
}

// Handle room messages
function handleRoomMessage(data) {
    switch (data.type) {
        case 'join':
            if (data.username !== localStorage.getItem('username')) {
                handleNewParticipant(data);
            }
            break;
        case 'offer':
            handleOffer(data);
            break;
        case 'answer':
            handleAnswer(data);
            break;
        case 'ice-candidate':
            handleIceCandidate(data);
            break;
        case 'leave':
            handleParticipantLeft(data);
            break;
    }
}

// Handle new participant
async function handleNewParticipant(data) {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[data.username] = peerConnection;
    
    // Add local stream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            stompClient.send('/app/ice-candidate', {}, JSON.stringify({
                username: localStorage.getItem('username'),
                candidate: event.candidate,
                roomId: currentRoom,
                targetUser: data.username
            }));
        }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
        const videoGrid = document.getElementById('video-grid');
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = `video-${data.username}`;
        
        const video = document.createElement('video');
        video.srcObject = event.streams[0];
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        
        videoContainer.appendChild(video);
        videoGrid.appendChild(videoContainer);
    };
    
    // Create and send offer
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        stompClient.send('/app/offer', {}, JSON.stringify({
            username: localStorage.getItem('username'),
            offer: offer,
            roomId: currentRoom,
            targetUser: data.username
        }));
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

// Handle received offer
async function handleOffer(data) {
    if (data.targetUser !== localStorage.getItem('username')) return;
    
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[data.username] = peerConnection;
    
    // Add local stream
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            stompClient.send('/app/ice-candidate', {}, JSON.stringify({
                username: localStorage.getItem('username'),
                candidate: event.candidate,
                roomId: currentRoom,
                targetUser: data.username
            }));
        }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
        const videoGrid = document.getElementById('video-grid');
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.id = `video-${data.username}`;
        
        const video = document.createElement('video');
        video.srcObject = event.streams[0];
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
        
        videoContainer.appendChild(video);
        videoGrid.appendChild(videoContainer);
    };
    
    // Set remote description and create answer
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        stompClient.send('/app/answer', {}, JSON.stringify({
            username: localStorage.getItem('username'),
            answer: answer,
            roomId: currentRoom,
            targetUser: data.username
        }));
    } catch (error) {
        console.error('Error creating answer:', error);
    }
}

// Handle received answer
async function handleAnswer(data) {
    if (data.targetUser !== localStorage.getItem('username')) return;
    
    const peerConnection = peerConnections[data.username];
    if (peerConnection) {
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (error) {
            console.error('Error setting remote description:', error);
        }
    }
}

// Handle ICE candidate
async function handleIceCandidate(data) {
    if (data.targetUser !== localStorage.getItem('username')) return;
    
    const peerConnection = peerConnections[data.username];
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }
}

// Handle participant left
function handleParticipantLeft(data) {
    const videoContainer = document.getElementById(`video-${data.username}`);
    if (videoContainer) {
        videoContainer.remove();
    }
    
    if (peerConnections[data.username]) {
        peerConnections[data.username].close();
        delete peerConnections[data.username];
    }
}

// Setup control buttons
function setupControls() {
    const toggleVideoBtn = document.getElementById('toggle-video');
    const toggleAudioBtn = document.getElementById('toggle-audio');
    const shareScreenBtn = document.getElementById('share-screen');
    const joinBtn = document.getElementById('join-btn');
    const leaveBtn = document.getElementById('leave-btn');
    
    // Toggle video
    toggleVideoBtn.addEventListener('click', () => {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            toggleVideoBtn.innerHTML = `<i class="fas fa-video${videoTrack.enabled ? '' : '-slash'}"></i>`;
        }
    });
    
    // Toggle audio
    toggleAudioBtn.addEventListener('click', () => {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            toggleAudioBtn.innerHTML = `<i class="fas fa-microphone${audioTrack.enabled ? '' : '-slash'}"></i>`;
        }
    });
    
    // Share screen
    shareScreenBtn.addEventListener('click', async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true
            });
            
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = Object.values(peerConnections).map(pc => 
                pc.getSenders().find(s => s.track.kind === 'video')
            );
            
            sender.forEach(s => s.replaceTrack(videoTrack));
            localVideo.srcObject = screenStream;
            
            videoTrack.onended = () => {
                const cameraTrack = localStream.getVideoTracks()[0];
                sender.forEach(s => s.replaceTrack(cameraTrack));
                localVideo.srcObject = localStream;
            };
        } catch (error) {
            console.error('Error sharing screen:', error);
        }
    });
    
    // Join room
    joinBtn.addEventListener('click', () => {
        const roomId = document.getElementById('room-id').value;
        if (roomId) {
            currentRoom = roomId;
            stompClient.send('/app/join', {}, JSON.stringify({
                username: localStorage.getItem('username'),
                roomId: roomId
            }));
            joinBtn.style.display = 'none';
            leaveBtn.style.display = 'inline-block';
        }
    });
    
    // Leave room
    leaveBtn.addEventListener('click', () => {
        if (currentRoom) {
            stompClient.send('/app/leave', {}, JSON.stringify({
                username: localStorage.getItem('username'),
                roomId: currentRoom
            }));
            
            // Close all peer connections
            Object.values(peerConnections).forEach(pc => pc.close());
            peerConnections = {};
            
            // Clear video grid except local video
            const videoGrid = document.getElementById('video-grid');
            while (videoGrid.firstChild) {
                videoGrid.removeChild(videoGrid.firstChild);
            }
            videoGrid.appendChild(localVideo.parentElement);
            
            currentRoom = null;
            leaveBtn.style.display = 'none';
            joinBtn.style.display = 'inline-block';
        }
    });
} 