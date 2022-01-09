let localVideo = document.getElementById("local-video")
let remoteVideo = document.getElementById("remote-video")
let s_cam = document.getElementById("cam_switch")
let togg_mic = document.getElementById("togg_mic")
let ic_mic = document.getElementById("ic_togg_mic")
let togg_cam = document.getElementById("togg_cam")
let ic_cam = document.getElementById("ic_togg_cam")
let end = document.getElementById("end")

var Col_grey = 'rgb(48, 49, 53)';
var Col_red = 'rgb(234, 66, 53)';

localVideo.style.opacity = 0
remoteVideo.style.opacity = 0

localVideo.onplaying = () => { localVideo.style.opacity = 1 }
remoteVideo.onplaying = () => { remoteVideo.style.opacity = 1 }
var urlParams = new URL(location.href).searchParams;
var ID2 = urlParams.get("call");
var ID1;
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

    if(ID2) {
        init(ID2+' web');
    }

});

let peer

function init(userId) {

    ID1 = userId;
    
    peer = new Peer(userId, {
        host: 'd-call.herokuapp.com',
        port: 443,
        secure: true
    })

    peer.on('open',()=>{
        startCall(ID2)
    })

    listen()
}

let localStream

function listen() {
    peer.on('call', (remoteCall) => {

        navigator.getUserMedia({
            audio: true, 
            video: {
                deviceId: VideoTracks[cam].deviceId
            }
        }, (stream) => {
            localStream = null
            localStream = stream
            localVideo.srcObject = localStream

            remoteCall.answer(localStream)

            listenStream(remoteCall)

        })
        
    })
}

function startCall(otherUserId) {
    
    ID2 = otherUserId

    navigator.getUserMedia({
        audio: true,
        video: {
                deviceId: VideoTracks[cam].deviceId
            }
        }, (stream) => {
            localStream = null
            localStream = stream
            localVideo.srcObject = localStream

        const localCall = peer.call(otherUserId, localStream)

        listenStream(localCall)

    })
}

function listenStream(call) {
    call.on('stream', (remoteStream) => {
            
        remoteVideo.srcObject = remoteStream
    
        remoteVideo.className = "primary-video"
        localVideo.className = "secondary-video"
    })
}

function toggleVideo() {
    if (localStream.getVideoTracks()[0].enabled == true) {
        localStream.getVideoTracks()[0].enabled = false
        ic_cam.src = "./icons/ic_videocam_off_black.png"
        togg_cam.style.backgroundColor = Col_red;
    } else {
        localStream.getVideoTracks()[0].enabled = true
        ic_cam.src = "./icons/ic_videocam_black.png"
        togg_cam.style.backgroundColor = Col_grey;
    }
} 

function toggleAudio() {
    if (localStream.getAudioTracks()[0].enabled == true) {
        localStream.getAudioTracks()[0].enabled = false
        ic_mic.src = "./icons/ic_mic_off_black.png"
        togg_mic.style.backgroundColor = Col_red;
    } else {
        localStream.getAudioTracks()[0].enabled = true
        ic_mic.src = "./icons/ic_mic_black.png"
        togg_mic.style.backgroundColor = Col_grey;
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
    
    peer._connections.values().next().value[0].close()
    
    startCall(ID2)
}

s_cam.addEventListener('click',()=>{
    switchCam()
})

togg_mic.addEventListener('click',()=>{
    toggleAudio()
})

togg_cam.addEventListener('click',()=>{
    toggleVideo()
})
