const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
const AUTH_URL = `http://localhost:3000`;
const API_BASE_URL = 'https://api.videosdk.live';
const videoLink = document.querySelector('.link');
const userData = [];

const micBtn = document.getElementById('btnMic');
const camBtn = document.getElementById('btnCamera');
const screenShareBtn = document.getElementById('btnScreenShare');
const videoContainer = document.getElementById('stream__container');
const screenShare = document.getElementById('stream__box');

window.addEventListener('load', () => {
  videoLink.textContent = meetingId;
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
