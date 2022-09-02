// AgoraRTC.setLogLevel(3);

const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
const AUTH_URL = `http://localhost:3000`;
const API_BASE_URL = 'https://api.videosdk.live';

const videoLink = document.querySelector('.link');
const micBtn = document.getElementById('btnMic');
const camBtn = document.getElementById('btnCamera');
const screenShareBtn = document.getElementById('btnScreenShare');
const videoContainer = document.getElementById('stream__container');

// Expand Video Frame on Click
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
let userIdInDisplayFrame = null;

const expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget);
  userIdInDisplayFrame = e.currentTarget.id;

  for (let i = 0; videoFrames.length > i; i++) {
    if (videoFrames[i].id != userIdInDisplayFrame) {
      videoFrames[i].style.width = '250px';
      videoFrames[i].style.height = '150px';
    }
  }
};
for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener('click', expandVideoFrame);
}

const hideDisplayFrame = () => {
  userIdInDisplayFrame = null;
  displayFrame.style.display = null;

  let child = displayFrame.children[0];
  document.getElementById('streams__container').appendChild(child);

  try {
    if (videoFrames[i].id != userIdInDisplayFrame) {
      videoFrames[i].style.width = '300px';
      videoFrames[i].style.height = '200px';
    }
  } catch (err) {
    console.log(err);
  }
};

displayFrame.addEventListener('click', hideDisplayFrame);

// Copy Meeting ID
const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};
videoLink.addEventListener('click', copyClipboard);
