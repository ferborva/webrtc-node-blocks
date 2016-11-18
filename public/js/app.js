// Check for webKit and Moz versions of WebRTC APIs

window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
window.URL = window.URL || window.mozURL || window.webkitURL;
window.navigator.getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
window.MediaSource = window.MediaSource || window.WebKitMediaSource;

if (!window.RTCPeerConnection || !navigator.getUserMedia) {
    console.log('WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.');
} else {
    console.log('WebRTC is supported! YAY!')
}

window.userStream = '';
window.socket = '';
window.peers = [];

function getStream() {
    var promise = new Promise(function(resolve, reject) {
        if (window.userStream) {
            resolve(window.userStream);
        } else
            navigator.getUserMedia({
                video: true,
                audio: true
            }, function(stream) {
                console.log('Video and Audio stream correctly obtained');
                window.userStream = stream;
                resolve(window.userStream);
            }, function(e) {
                console.log('No audio/video permissions. Please refresh your browser and allow the audio/video capturing.');
                reject(e);
            });
    });
    return promise;
}

function initSocket() {
    window.socket = io();
    console.log('Socket open with server!!');
    setupListeners();
}

function setupListeners() {
    window.socket.on('newVideoBlob', function(data) {
        if (window.ms.readyState === 'open') {
            try {
                window.sourceBuffer.appendBuffer(data.blob);
            } catch (e) {
                console.log(e)
            }
        } else {
            window.ms = new MediaSource();
            window.ms.onsourceopen = onSourceOpen;
            var broadcastVideo = document.querySelector('#broadcast');
            broadcastVideo.src = window.URL.createObjectURL(window.ms);

            function onSourceOpen(e) {
                console.log('open source')
                window.sourceBuffer = window.ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            }
        }
    });
}

function getBlobUrl(stream) {
    var url = URL.createObjectURL(stream);
    console.log('Obtain a blob URL from the stream object');
    console.log(url);
    return url;
}

getStream().then(function(stream) {
    var video = document.querySelector('#myvideo');
    var blob = getBlobUrl(stream);
    video.src = blob;
});


function startEmitting() {
    // var videoStream = ss.createStream(window.userStream);
    // ss(window.socket).emit('video', window.userStream);
    // ss.createBlobReadStream(getBlobUrl(window.userStream)).pipe(videoStream);
    window.mediarecorder = new MediaRecorder(window.userStream);
    window.mediarecorder.ondataavailable = function(e) {
        window.socket.emit('videoBlob', {blob: e.data});
    }
    window.mediarecorder.start(2000);
}

function stopEmitting() {
    window.mediarecorder.stop();
}

function openSocket() {
    initSocket();
}

window.ms = new MediaSource();
window.ms.onsourceopen = onSourceOpen;
var broadcastVideo = document.querySelector('#broadcast');
broadcastVideo.src = window.URL.createObjectURL(window.ms);

function onSourceOpen(e) {
    console.log('open source')
    window.sourceBuffer = window.ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
}

initSocket();

