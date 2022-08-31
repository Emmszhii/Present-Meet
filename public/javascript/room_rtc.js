const APP_ID = '989dd2a862d04776bbadc57f37c78976';
const APP_CERTIFICATE = `c7606af9e6fa4a899db10bba251415d4`;

const url = window.location.search;
const urlParams = new URLSearchParams(url);
const roomId = urlParams.get('meetingId').trim();
const videoLink = document.querySelector('.link');

const userData = [];

const uid = Math.floor(Math.random() * 100);
console.log(roomId);

let token = null;
let client;

//room.html?room=234

// console.log(roomId);
// if (!roomId) {
//   roomId = 'main';
// }

let localTracks = [];
let remoteUsers = {};

let joinRoomInit = async () => {
  client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  await client.join(APP_ID, roomId, token, uid);
};

let joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `
    <div class="video__container" id="user-container-${uid}">
      <div class="video-player id="${uid}"></div>
    </div>
  `;

  document
    .getElementById('streams__container')
    .insertAdjacentHTML('beforeend', player);

  localTracks[1].play(`user-${uid}`, (err) => {
    console.log(err);
  });
};

joinRoomInit();
