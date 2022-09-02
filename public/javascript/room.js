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
const screenShare = document.getElementById('stream__box');

const userData = {};
let APP_ID;
let id;
let fullName;
let token;
let client;
let localTracks = [];
let remoteUsers = {};

const getInfo = async () => {
  const url = `${AUTH_URL}/getInfo`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  return data;
};
// getInfo().then((data) => {
// userData.fullName = data.user.fullName;
// userData.id = data.user.googleId;
// userData.sliceId = data.user.googleId.slice(0, 4);
// fullName = data.user.fullName;
// id = data.user.googleId;
// console.log(fullName);
// console.log('ID : ' + id);
// });
const getToken = async () => {
  getInfo().then(async (user) => {
    userData.fullName = user.user.fullName;
    userData.id = user.user.googleId;
    userData.sliceId = Number(user.user.googleId.slice(0, 4));
    const url = `${AUTH_URL}/rtc/${meetingId}/publisher/uid/${userData.sliceId}`;
    const res = await fetch(url, { method: 'GET' });
    await res.json().then((data) => {
      userData.APP_ID = data.AGORA_APP_ID;
      userData.token = data.rtcToken;
    });
    // console.log(data);
    // return data;
  });

  // const url = `${AUTH_URL}/rtc/${meetingId}/publisher/uid/${userData.sliceId}`;
  // const res = await fetch(url, { method: 'GET' });
  // const data = await res.json();
  // return data;
};

getToken().then((data) => {
  // userData.APP_ID = data.AGORA_APP_ID;
  // userData.token = data.rtcToken;
  // console.log(userData);
  // APP_ID = data.AGORA_APP_ID;
  // token = data.rtcToken;
  // console.log(APP_ID, token);
});

const joinRoomInit = async () => {
  client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  const id = userData.id.slice(0, 4);
  console.log(id);
  await client.join(
    userData.APP_ID,
    meetingId,
    userData.token,
    userData.sliceId
  );

  joinStream();
};

const joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `
    <div class="video__container" id="user-container-${id}">
      <div class="video-player" id="user-${id}"></div>
        <span class="name">${fullName}</span>
    </div>
  `;

  document
    .getElementById('streams__container')
    .insertAdjacentHTML('beforeend', player);

  localTracks[1].play(`user-${id}`);
};

window.addEventListener('load', () => {
  videoLink.textContent = meetingId;

  // getToken();
  // const url = `${AUTH_URL}/getInfo`;
  // (async function () {
  //   const res = await fetch(url, { method: 'GET' });
  //   await res.json().then((data) => {
  //     id = data.user._id;
  //     fullName = data.user.fullName;
  //
  //   });
  // })();
  setTimeout(joinRoomInit, 5000);
});

// ((async function () {
//   const url = `${AUTH_URL}/getInfo`;
//   const res = await fetch(url, { method: 'GET' });
//   await res.json().then((data) => {
//     console.log(data);
//   });
// },
// async function () {
//   const url = `${AUTH_URL}/rtc/${meetingId}/publisher/uid/${id}`;
//   const res = await fetch(url, { method: 'GET' });
//   await res.json().then((data) => {
//     console.log(data);
//     // fullName = data.user.fullName
//   });
// })());
