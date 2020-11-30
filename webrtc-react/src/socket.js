import io from 'socket.io-client'

const config = {
    iceServers: [
        { 
          "urls": "stun:stun.l.google.com:19302",
        },
    ],
};

const socketUrl = "http://localhost:5050"
const socketPath = "/foo/bar"

const socket = io.connect(socketUrl, { path: socketPath})

export {socket, config}