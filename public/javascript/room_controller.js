// For logging errors in agora set 3 for warnings and error to be log at console set 1 to log it all.
AgoraRTC.setLogLevel(3);

import { faceRecognitionHandler } from './room_face_recognition.js';
import {
  getTokens,
  joinRoomInit,
  toggleCamera,
  toggleMic,
  toggleScreen,
  joinStream,
  leaveStream,
} from './room_rtc.js';
import { sendMessage, leaveChannel } from './room_rtm.js';
import {
  meetingId,
  membersToggle,
  messagesToggle,
  copyClipboard,
  hideDisplayFrame,
  settingsToggle,
  refreshDeviceModal,
} from './room.js';

// Event Listeners
// refresh devices
document
  .getElementById('refresh')
  .addEventListener('click', refreshDeviceModal);
// copy to clipboard
document.getElementById('link-btn').addEventListener('click', copyClipboard);
// messages toggle
document.getElementById('chat-btn').addEventListener('click', messagesToggle);
// participants toggle
document.getElementById('users-btn').addEventListener('click', membersToggle);
// Camera Button
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
// Mic Button
document.getElementById('mic-btn').addEventListener('click', toggleMic);
// Screen Share Button
document.getElementById('screen-btn').addEventListener('click', toggleScreen);
// Leave Stream
document.getElementById('leave-btn').addEventListener('click', leaveStream);
// Join Stream
document.getElementById('join-btn').addEventListener('click', joinStream);
// open settings modal
document
  .getElementById('settings-btn')
  .addEventListener('click', settingsToggle);
// close modal settings
document.getElementById('setup-btn').addEventListener('click', settingsToggle);
// // User send message
document
  .getElementById('message__form')
  .addEventListener('submit', sendMessage);
// toggle display Frame
document
  .getElementById('stream__box')
  .addEventListener('click', hideDisplayFrame);
// // when a user forced close they will be deleted to the dom
window.addEventListener('beforeunload', leaveChannel);
// // when users click esc btn close the msg & members modal
document.addEventListener('keydown', (e) => {
  const membersModal = document.getElementById('members__container');
  const messagesModal = document.getElementById('messages__container');
  const membersBtn = document.getElementById('users-btn');
  const messagesBtn = document.getElementById('chat-btn');

  if (e.key === 'Escape') {
    if ((membersModal.style.display = 'block')) {
      membersModal.style.display = 'none';
      membersBtn.classList.remove('active');
    }
    if ((messagesModal.style.display = 'block')) {
      messagesModal.style.display = 'none';
      messagesBtn.classList.remove('active');
    }
  }
});

// // webpage on load
window.addEventListener('load', () => {
  // display the meeting link
  document.querySelector('.link').textContent = meetingId;
  // get tokens and user info
  // load faces
  Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  ])
    .then(() => {
      console.log(`face api module success`);
    })
    .catch((err) => {
      console.log(err);
    });

  getTokens()
    .then(() => {
      console.log(`data success`);
    })
    .catch((err) => {
      console.log(err);
    });

  // faceRecognitionHandler();
});
