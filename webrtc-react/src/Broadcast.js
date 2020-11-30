import { useState, useRef, useEffect } from 'react'
import { createSocket, config } from './socket'

const Broadcast = () => {
    const videoRef = useRef(null)
    const socket = createSocket()
    const audioSource = useRef(null)
    const videoSource = useRef(null)
    const peerConnections = useRef({})


    function getDevices() {
        return navigator.mediaDevices.enumerateDevices();
    }

    function handleDevices(deviceInfos) {
        window.deviceInfos = deviceInfos;
        for (const deviceInfo of deviceInfos) {
            const option = document.createElement("option");
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === "audioinput") {
                option.text = deviceInfo.label || `Microphone ${audioSource.current.length + 1}`;
                audioSource.current.appendChild(option);
            } else if (deviceInfo.kind === "videoinput") {
                option.text = deviceInfo.label || `Camera ${videoSource.current.length + 1}`;
                videoSource.current.appendChild(option);
            }
        }
    }

    const getStream = () => {
        if (window.stream) {
            window.stream.getTracks().forEach(track => {
                track.stop();
            });
        }
        const audio = audioSource.current.value;
        const video = videoSource.current.value;
        const constraints = {
            audio: { deviceId: audio ? { exact: audio } : undefined },
            video: { deviceId: video ? { exact: video } : undefined }
        };
        return navigator.mediaDevices
            .getUserMedia(constraints)
            .then(handleStream)
            .catch(handleError);
    }

    const handleStream = (stream) => {
        window.stream = stream;
        audioSource.current.selectedIndex = [...audioSource.current.options].findIndex(
            option => option.text === stream.getAudioTracks()[0].label
        );
        videoSource.current.selectedIndex = [...videoSource.current.options].findIndex(
            option => option.text === stream.getVideoTracks()[0].label
        );
        videoRef.current.srcObject = stream;
        socket.emit("broadcaster");
    }

    const handleError = (error) => {
        console.error("Error: ", error);
    }

    useEffect(() => {
        socket.on("candidate", (id, candidate) => {
            if (peerConnections.current[id]) {
                peerConnections.current[id].addIceCandidate(new RTCIceCandidate(candidate))
            }
        });

        socket.on("disconnectPeer", id => {
            peerConnections.current[id].close()
            delete peerConnections.current[id]
        });

        socket.on("answer", (id, description) => {
            if (peerConnections.current[id]) {
                peerConnections.current[id].setRemoteDescription(description);
            }
        });

        socket.on("watcher", id => {
            const peerConnection = new RTCPeerConnection(config);

            peerConnections.current[id] = peerConnection

            const stream = videoRef.current.srcObject;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit("candidate", id, event.candidate);
                }
            };

            peerConnection
                .createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socket.emit("offer", id, peerConnection.localDescription);
                });

        });

        getStream()
            .then(getDevices)
            .then(handleDevices)

        return () => {
            socket.disconnect()
        }

    }, [])


    return (
        <div>
            <video playsInline autoPlay muted id="videoRef" ref={videoRef} />

            <section className="select">
                <label for="audioSource">Audio source: </label>
                <select id="audioSource" ref={audioSource} onChange={getStream}></select>
            </section>

            <section className="select">
                <label for="videoSource">Video source: </label>
                <select id="videoSource" ref={videoSource} onChange={getStream}></select>
            </section>
        </div>
    )
}

export default Broadcast