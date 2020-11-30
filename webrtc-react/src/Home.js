import { useState, useRef, useEffect } from 'react'
import { createSocket, config } from './socket'


const Home = () => {
  const peerConnection = useRef()
  const videoRef = useRef(null)
  const socket = createSocket()

  useEffect(() => {
    socket.on("offer", (id, description) => {
      peerConnection.current = new RTCPeerConnection(config);
      peerConnection
        .current
        .setRemoteDescription(description)
        .then(() => peerConnection.current.createAnswer())
        .then(sdp => peerConnection.current.setLocalDescription(sdp))
        .then(() => {
          socket.emit("answer", id, peerConnection.current.localDescription);
        });
      peerConnection.current.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };
    });


    socket.on("candidate", (id, candidate) => {
      peerConnection
        .current
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(e => console.error(e));
    });

    socket.on("connect", () => {
      socket.emit("watcher");
    });

    socket.on("broadcaster", () => {
      socket.emit("watcher");
    });

    socket.on("disconnectPeer", () => {
      peerConnection.current.close();
    });

    return () => {
      socket.disconnect()
    }

  }, [])


  return (
    <video playsInline autoPlay muted id="videoRef" ref={videoRef} />
  )
}

export default Home