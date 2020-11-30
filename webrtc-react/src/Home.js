import {useState, useRef, useEffect} from 'react'
import {socket, config} from './socket'


const Home = () => {
    const peerConnection = useRef()
    const videoRef = useRef(null)

    useEffect( () => {
        socket.on("offer", (id, description) => {
            peerConnection = new RTCPeerConnection(config);
            peerConnection
              .current
              .setRemoteDescription(description)
              .then(() => peerConnection.createAnswer())
              .then(sdp => peerConnection.setLocalDescription(sdp))
              .then(() => {
                socket.emit("answer", id, peerConnection.localDescription);
              });
            peerConnection.current.ontrack = event => {
                videoRef.srcObject = event.streams[0];
            };
            peerConnection.current.onicecandidate = event => {
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
              socket.close()
          }

    } , [])


    return(       
        <video id="videoRef" ref={videoRef} autoPlay />
    )
}

export default Home