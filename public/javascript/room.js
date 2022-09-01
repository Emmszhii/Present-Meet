const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
const videoConfig = urlParams.get('video');
const audioConfig = urlParams.get('audio');
const AUTH_URL = `http://localhost:3000`;
const API_BASE_URL = 'https://api.videosdk.live';
const videoLink = document.querySelector('.link');
const userData = [];

const micBtn = document.getElementById('btnMic');
const camBtn = document.getElementById('btnCamera');
const screenShareBtn = document.getElementById('btnScreenShare');
const videoContainer = document.getElementById('stream__container');
const screenShare = document.getElementById('stream__box');

let mic = true;
let video = true;
let screenShareOn = false;

// Copy Meeting ID
const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};

videoLink.addEventListener('click', copyClipboard);

// Initializing the meeting
// navigator.mediaDevices
//   .getUserMedia({
//     video: true,
//     audio: true,
// })
// .then((stream) => {
// console.log(stream);
// joinPageWebcam.srcObject = stream;
// joinPageWebcam.play();
// });

// TOKEN GENERATOR
// async function tokenGeneration() {
//   try {
//     const response = await fetch(`${AUTH_URL}/get-token`, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     });
//     const { TOKEN } = await response.json();
//     return TOKEN;
//   } catch (e) {
//     console.log(e);
//   }
// }

// token = tokenGeneration().then((res) => res);
// console.log(token);

window.addEventListener('load', () => {
  videoLink.textContent = meetingId;
  audioConfig === null ? (mic = false) : (mic = true);
  videoConfig === null ? (video = false) : (video = true);
  console.log(mic, video);
  const url = `${AUTH_URL}/profile`;
  (async function () {
    const res = await fetch(url, { method: 'GET' });
    await res.json().then((data) => {
      userData.push(data.profile);
      fullName = userData[0].fullName;
      id = userData[0]._id;
    });
  })();
});
