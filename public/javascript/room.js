// For logging errors in agora set 3 for warnings and error to be log at console set 1 to log it all.
AgoraRTC.setLogLevel(3);

// Initializing variables
const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
const AUTH_URL = `http://localhost:3000`;
const API_BASE_URL = 'https://api.videosdk.live';
// Selectors
const videoLink = document.querySelector('.link');
const micBtn = document.getElementById('btnMic');
const camBtn = document.getElementById('btnCamera');
const screenShareBtn = document.getElementById('btnScreenShare');
const videoContainer = document.getElementById('stream__container');
const usersBtn = document.getElementById('users-btn');
const chatBtn = document.getElementById('chat-btn');
const loader = document.getElementById('preloader');
const linkBtn = document.getElementById('link-btn');

// Expand Video Frame on Click
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
let userIdInDisplayFrame = null;

// Expand VideoFrame Function
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
      videoFrames[i].style.width = '300px';
      videoFrames[i].style.height = '200px';
    }
  }
};
for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener('click', expandVideoFrame);
}

// Hide Display Frame Function
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

// Copy Meeting ID function
const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};

// message and participant toggle

function messagesToggle(e) {
  const btn = e.currentTarget;
  const x = document.getElementById('messages__container');
  const y = document.getElementById('members__container');
  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    btn.classList.add('active');
    x.style.display = 'block';
  }
}

function membersToggle(e) {
  const btn = e.currentTarget;
  const x = document.getElementById('members__container');
  const y = document.getElementById('messages__container');
  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    btn.classList.add('active');
    x.style.display = 'block';
  }
}

// Event Listeners
// display and un-display
linkBtn.addEventListener('click', copyClipboard);
usersBtn.addEventListener('click', membersToggle);
chatBtn.addEventListener('click', messagesToggle);
displayFrame.addEventListener('click', hideDisplayFrame);
// copying the meeting code
// videoLink.addEventListener('click', copyClipboard);
