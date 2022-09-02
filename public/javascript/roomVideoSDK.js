const url = window.location.search;
const urlParams = new URLSearchParams(url);
const idRoom = urlParams.get('meetingId').trim();
const videoConfig = urlParams.get('video');
const audioConfig = urlParams.get('audio');
const AUTH_URL = `http://localhost:3000`;
const API_BASE_URL = 'https://api.videosdk.live';
const videoLink = document.querySelector('.link');
const userData = [];

const micBtn = document.getElementById('btnMic');
const camBtn = document.getElementById('btnCamera');
const screenShareBtn = document.getElementById('btnScreenShare');
const videoContainer = document.getElementById('streams__container');
const screenShare = document.getElementById('stream__box');

let token;

let idMeet;
let displayName;
let idUser;
let mic = false;
let video = false;
let screenShareOn = false;
let meeting;
let localParticipant;
let totalParticipants = 0;

navigator.mediaDevices
  .getUserMedia({
    video: true,
  })
  .then(
    (stream) => (video.srcObject = stream),
    (err) => console.log(err)
  );

// Copy Meeting ID
const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};
videoLink.addEventListener('click', copyClipboard);

navigator.getUserMedia(
  {
    video: {},
  },
  (stream) => {
    video.srcObject = stream;
  },
  (err) => console.log(err)
);

// Initializing the meeting
// TOKEN GENERATOR
async function tokenGeneration() {
  try {
    const response = await fetch(`${AUTH_URL}/get-token`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const { token } = await response.json();
    return token;
  } catch (e) {
    console.log(e);
  }
}

const getMeetingId = async (token) => {
  try {
    const VIDEOSDK_API_ENDPOINT = `${AUTH_URL}/create-meeting`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, region: 'sg001' }),
    };
    const response = await fetch(VIDEOSDK_API_ENDPOINT, options)
      .then(async (result) => {
        const data = await result.json();
        console.log(data);
        return data;
      })
      .catch((error) => console.log('error', error));
    return response;
  } catch (e) {
    console.log(e);
  }
};

tokenGeneration((tok) => {
  token = tok;
  getMeetingId(tok)
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Validate a room ID
const validateRoomID = async (token, roomId) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  };
  const url = `https://api.videosdk.live/v2/rooms/validate/${roomId}`;
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
};

function createLocalParticipant() {
  totalParticipants++;
  localParticipant = createVideoElement(meeting.localParticipant.id);
  localParticipantAudio = createAudioElement(meeting.localParticipant.id);
  // console.log("localPartcipant.id : ", localParticipant.className);
  // console.log("meeting.localPartcipant.id : ", meeting.localParticipant.id);
  videoContainer.appendChild(localParticipant);
}

const addParticipantToList = ({ id, displayName }) => {
  let player = `
  <div class="video__container" id="${id}">
    <span id="${displayName + id}">${displayName}</span>
  </div>
  `;
  videoContainer.appendChild(player);
};

// Initialize Meet
const init = async (info) => {
  // let customVideoTrack = await window.VideoSDK.createCameraVideoTrack({
  //   optimizationMode: 'motion',
  //   encoderConfig: 'h540p_w960p',
  //   facingMode: 'environment',
  // });

  // let customAudioTrack = await VideoSDK.createMicrophoneAudioTrack({
  //   encoderConfig: 'high_quality',
  //   noiseConfig: {
  //     noiseSuppresion: true,
  //     echoCancellation: true,
  //     autoGainControl: true,
  //   },
  // });

  window.VideoSDK.config(info[0]);
  meeting = window.VideoSDK.initMeeting({
    meetingId: info[1],
    name: info[2],
    participantId: info[3],
    micEnable: true,
    webcamEnabled: true,
    // customCameraVideoTrack: customVideoTrack,
    // customMicrophoneAudioTrack: customAudioTrack,
  });

  console.log(meeting);
  meeting.join();

  // createLocal Participant
  // createLocalParticipant();

  // if (totalParticipants != 0) {
  //   addParticipantToList({
  //     id: meeting.localParticipant.id,
  //     displayName: localParticipant.displayName,
  //   });
  // }
};

window.addEventListener('load', () => {
  videoLink.textContent = idRoom;
  audioConfig === null ? (mic = false) : (mic = true);
  videoConfig === null ? (video = false) : (video = true);
  const url = `${AUTH_URL}/getInfo`;
  (async function () {
    const res = await fetch(url, { method: 'GET' });
    await res.json().then((data) => {
      const info = [
        data.token,
        data.room.id,
        data.user.fullName,
        data.user._id,
      ];
      // console.log(info);
      init(info);
      // token = data.token;
      // console.log(token);
      // TOKEN = data.token;
      // console.log(token);
      // idMeet = data.room.id;
      // console.log(idMeet);
      // displayName = data.user.fullName;
      // console.log(displayName);
      // idUser = data.user._id;
      // console.log(idUser);
    });
  })();
});
