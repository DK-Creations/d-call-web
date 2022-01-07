let localVideo = document.getElementById("local-video")
let remoteVideo = document.getElementById("remote-video")

localVideo.style.opacity = 0
remoteVideo.style.opacity = 0

localVideo.onplaying = () => { localVideo.style.opacity = 1 }
remoteVideo.onplaying = () => { remoteVideo.style.opacity = 1 }
var urlParams = new URL(location.href).searchParams;
var ID = urlParams.get("call");
var MYID;
var cam = 0;
var VideoTracks=[];
var AudioTracks=[];

navigator.mediaDevices.enumerateDevices().then((device)=>{
    for(var i=0; i < device.length; i++) {
        if(device[i].kind=='videoinput') {
            VideoTracks[VideoTracks.length] = device[i];
        }
    }
    for(var i=0; i < device.length; i++) {
        if(device[i].kind=='audioinput') {
            AudioTracks[AudioTracks.length] = device[i];
        }
    }

    if(ID) {
        init(ID+' web');
    }


});

let peer



function init(userId) {
    MYID = userId;
    peer = new Peer(userId, {
        host: 'd-call.herokuapp.com',
        port: 443,
        secure: true
    })

    peer.on('open',(c)=>{
        if(ID) {
            startCall(ID)
        }
    })

    peer.on('close',()=>{
        init(MYID);
    })

    listen()
}

let localStream
function listen() {
    peer.on('call', (call) => {

        navigator.getUserMedia({
            audio: true, 
            video: {
                deviceId: VideoTracks[cam].deviceId
            }
        }, (stream) => {
            localVideo.srcObject = null
            localStream = null
            localVideo.srcObject = stream
            localStream = stream

            call.answer(stream)
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = null
                remoteVideo.srcObject = remoteStream

                remoteVideo.className = "primary-video"
                localVideo.className = "secondary-video"

            })

        })
        
    })
}

function startCall(otherUserId) {
    
    navigator.getUserMedia({
        audio: true,
        video: {
                deviceId: VideoTracks[cam].deviceId
            }
        }, (stream) => {
            localVideo.srcObject = null
            localStream = null
            localVideo.srcObject = stream
            localStream = stream

        const call = peer.call(otherUserId, stream)
        call.on('stream', (remoteStream) => {
            remoteVideo.srcObject = null
            remoteVideo.srcObject = remoteStream

            remoteVideo.className = "primary-video"
            localVideo.className = "secondary-video"
        })

    })
}

function toggleVideo(b) {
    if (b == "true") {
        localStream.getVideoTracks()[0].enabled = true
    } else {
        localStream.getVideoTracks()[0].enabled = false
    }
} 

function toggleAudio(b) {
    if (b == "true") {
        localStream.getAudioTracks()[0].enabled = true
    } else {
        localStream.getAudioTracks()[0].enabled = false
    }
}

function switchCam() {
    if(cam+1 != VideoTracks.length) {
        cam = cam + 1;
    } else {
        cam = 0;
    }
    localStream.getTracks().forEach((track)=>{
        track.stop()
    })
    peer.destroy();
}
