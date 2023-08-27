// Get the user's media devices
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    localVideo.srcObject = stream;
  })
  .catch(error => {
    console.error('Error accessing media devices.', error);
  });

// Create an RTCPeerConnection instance
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peerConnection = new RTCPeerConnection(configuration);

peerConnection.onicecandidate = event => {
    if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
    }
};

peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
};

const socket = io.connect(window.location.origin);

socket.on('offer', (offer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection.createAnswer()
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            socket.emit('answer', peerConnection.localDescription);
        });
});

socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', (iceCandidate) => {
    const candidate = new RTCIceCandidate(iceCandidate);
    peerConnection.addIceCandidate(candidate);
});

startButton.addEventListener('click', () => {
    const localStream = localVideo.srcObject;
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            socket.emit('offer', peerConnection.localDescription);
        });
});

