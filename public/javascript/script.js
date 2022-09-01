const joinRoomBtn = document.getElementById('btnJoinModal');
const createRoomBtn = document.getElementById('btnCreateModal');
const joinModal = document.querySelector('.modalJoin-bg');
const createModal = document.querySelector('.modalCreate-bg');
const closeJoinBtn = document.querySelector('.modalJoin-close');
const closeCreateBtn = document.querySelector('.modalCreate-close');
const linkInput = document.getElementById('link');
const joinMeetingInput = document.getElementById('txtMeetingCode');

const baseURL = `https://api.videosdk.live`;
const LOCAL_SERVER_URL = `http://localhost:3000`;

let joinCode;
let meetId;

const copyClipboard = () => {
  const text = linkInput.value;
  navigator.clipboard.writeText(text);
};

joinRoomBtn.addEventListener('click', () => {
  joinModal.classList.add('bg-active');
  joinCode = joinMeetingInput.value;
});

closeJoinBtn.addEventListener('click', () => {
  joinModal.classList.remove('bg-active');
  joinMeetingInput.value = '';
});

createRoomBtn.addEventListener('click', () => {
  getMeetingId();
  createModal.classList.add('bg-active');
  linkInput.setAttribute('value', meetId);
});

closeCreateBtn.addEventListener('click', () => {
  createModal.classList.remove('bg-active');
});

const getMeetingId = async () => {
  const url = `${LOCAL_SERVER_URL}/create-meeting`;
  (async () => {
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    meetId = data.roomId;
    return data.roomId;
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

const joinMeeting = (e) => {
  joinCode = joinMeetingInput.value;
  if (joinCode.trim() === '') {
    return;
  }
};

window.addEventListener('load', () => {
  getMeetingId();
});
