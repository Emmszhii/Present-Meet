const joinRoomBtn = document.getElementById('btnJoinModal');
const createRoomBtn = document.getElementById('btnCreateModal');
const joinModal = document.querySelector('.modalJoin-bg');
const createModal = document.querySelector('.modalCreate-bg');
const closeJoinBtn = document.querySelector('.modalJoin-close');
const closeCreateBtn = document.querySelector('.modalCreate-close');
const linkInput = document.getElementById('link');
const joinMeetingInput = document.getElementById('txtMeetingCode');
const joinVideoBox = document.getElementById('videoCheckbox1');
const joinAudioBox = document.getElementById('micCheckbox1');
const createVideoBox = document.getElementById('videoCheckbox2');
const createAudioBox = document.getElementById('micCheckbox2');

const baseURL = `https://api.videosdk.live`;
const LOCAL_SERVER_URL = `http://localhost:3000`;

let joinCode;
let meetId;
let micEnable = false;
let webCamEnable = false;

// CHECKBOXES
joinVideoBox.addEventListener('click', (e) => {
  e.target.checked ? (e.target.value = true) : (e.target.value = false);
});
joinAudioBox.addEventListener('click', (e) => {
  e.target.checked ? (e.target.value = true) : (e.target.value = false);
});
createVideoBox.addEventListener('click', (e) => {
  e.target.checked ? (e.target.value = true) : (we.target.value = false);
});
createAudioBox.addEventListener('click', (e) => {
  e.target.checked ? (e.target.value = true) : (e.target.value = false);
});

const disable = () => {
  joinVideoBox.checked = false;
  joinAudioBox.checked = false;
  createVideoBox.checked = false;
  createAudioBox.checked = false;
  micEnable = false;
  webCamEnable = false;
};

// COPY MEETING CODE
const copyClipboard = () => {
  const text = linkInput.value;
  navigator.clipboard.writeText(text);
};

// MODAL
joinRoomBtn.addEventListener('click', () => {
  joinModal.classList.add('bg-active');
  joinCode = joinMeetingInput.value;
});

closeJoinBtn.addEventListener('click', () => {
  disable();
  joinMeetingInput.value = '';
  joinModal.classList.remove('bg-active');
});

createRoomBtn.addEventListener('click', () => {
  getMeetingId();
  createModal.classList.add('bg-active');
  linkInput.setAttribute('value', meetId);
});

closeCreateBtn.addEventListener('click', () => {
  disable();
  createModal.classList.remove('bg-active');
});

// MEETING CODE
const getMeetingId = async () => {
  const url = `${LOCAL_SERVER_URL}/create-meeting`;
  (async () => {
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    meetId = data.roomId;
    return data;
  })();
};

// TOKEN GENERATOR
async function tokenGeneration() {
  try {
    const response = await fetch(`${LOCAL_SERVER_URL}/get-token`, {
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

//
const joinMeeting = () => {
  joinCode = joinMeetingInput.value;
  if (joinCode.trim() === '') {
    return;
  }
};

// Onload Webpage
window.addEventListener('load', () => {
  getMeetingId();
});

const a = {
  name: 'akjhsdkhas',
  kasjdka: 'akshjdkajsk',
};
