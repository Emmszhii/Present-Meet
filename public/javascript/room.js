import {
  settings,
  userData,
  device,
  rtc,
  localDevice,
  audio_devices,
  video_devices,
  clearLocalTracks,
} from './room_rtc.js';

// For logging errors in agora set 3 for warnings and error to be log at console set 1 to log it all.
AgoraRTC.setLogLevel(3);

// Initializing variables
// getting meeting Link
const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();

// Expand Video Frame on Click
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
const userIdInDisplayFrame = { val: null };

// Expand VideoFrame Function
const expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget).scrollIntoView();
  userIdInDisplayFrame.val = e.currentTarget.id;

  resetTheFrames();
};

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener('click', expandVideoFrame);
}

// Hide Display Frame Function
const hideDisplayFrame = () => {
  userIdInDisplayFrame.val = null;
  displayFrame.style.display = null;

  let child = displayFrame.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  resetTheFrames();
};

const resetTheFrames = () => {
  const videoFrames = document.getElementsByClassName('video__container');
  for (let i = 0; videoFrames.length > i; i++) {
    videoFrames[i].style.width = '300px';
    videoFrames[i].style.height = '200px';
  }
};

// Copy Meeting ID function
const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};

// message and participant toggle
const messagesToggle = (e) => {
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
};

const membersToggle = (e) => {
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
};

const settingsToggle = () => {
  const btn = document.getElementById('settings-btn');
  const z = document.getElementById('modal-settings');
  if (z.style.display === 'block') {
    // display none
    btn.classList.remove('active');
    z.style.display = 'none';
    // reset local devices
    localDevice.length = 0;
    audio_devices.length = 0;
    video_devices.length = 0;
    // remove the player in the dom
    document.getElementById(`user-container-${userData.rtcId}`).remove();
    // clear local tracks
    clearLocalTracks();
  } else {
    // run settings modal
    // settings();
    refreshDeviceModal();
    // set active buttons and display it
    btn.classList.add('active');
    z.style.display = 'block';
  }
};

// create dropdown selected DOM
const createSelectElement = (name, val) => {
  // dynamic select
  const select = document.createElement('select');
  select.name = name;
  select.id = name;
  for (let i = 0; val.length > i; i++) {
    const option = document.createElement('option');
    option.value = val[i].label;
    option.text = val[i].label;
    select.appendChild(option);
  }

  const label = document.createElement('label');
  label.id = name;
  label.innerHTML = name;
  label.htmlFor = name;

  document
    .getElementById('devices-settings')
    .appendChild(label)
    .appendChild(select)
    .addEventListener('change', (e) => {
      if (name === 'Video') {
        const dev = val.find((device) => device.label === e.target.value);
        rtc.localTracks[1].setDevice(dev.deviceId).catch((e) => console.log(e));
        device.localVideo = dev.deviceId;
      }
      if (name === 'Audio') {
        const dev = val.find((device) => device.label === e.target.value);
        rtc.localTracks[0].setDevice(dev.deviceId).catch((e) => console.log(e));
        device.localAudio = dev.deviceId;
      }
    });

  // after settings are displayed then display the button to exit
  document.getElementById('setup-btn').style.display = 'block';
};

const refreshDeviceModal = () => {
  localDevice.length = 0;
  audio_devices.length = 0;
  video_devices.length = 0;
  document.getElementById('setup-btn').style.display = 'none';

  clearLocalTracks();

  const playerDom = document.getElementById(`user-container-${userData.rtcId}`);
  if (playerDom) playerDom.remove();
  document.getElementById('Video').remove();
  document.getElementById('Audio').remove();
  settings();
};

export {
  displayFrame,
  videoFrames,
  userIdInDisplayFrame,
  meetingId,
  membersToggle,
  messagesToggle,
  copyClipboard,
  resetTheFrames,
  hideDisplayFrame,
  expandVideoFrame,
  settingsToggle,
  createSelectElement,
  refreshDeviceModal,
};
