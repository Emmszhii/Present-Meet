// For logging errors in agora set 3 for warnings and error to be log at console set 1 to log it all.
AgoraRTC.setLogLevel(3);

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
} from './room.js';

// Event Listeners

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
  getTokens();
  // need 3 seconds to run because of fetching the info and tokens
  setTimeout(joinRoomInit, 3000);
});
