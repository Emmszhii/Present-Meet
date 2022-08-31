const joinRoomBtn = document.getElementById('btnJoinModal');
const createRoomBtn = document.getElementById('btnCreateModal');
const joinModal = document.querySelector('.modalJoin-bg');
const createModal = document.querySelector('.modalCreate-bg');
const closeJoinBtn = document.querySelector('.modalJoin-close');
const closeCreateBtn = document.querySelector('.modalCreate-close');
const linkInput = document.getElementById('link');

const userData = [];

const baseURL = `https://api.videosdk.live`;
const LOCAL_SERVER_URL = `http://localhost:3000`;

// declare all characters
const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// program to generate random strings
function generateString(length) {
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const copyClipboard = () => {
  const text = linkInput.value;
  navigator.clipboard.writeText(text);
};

joinRoomBtn.addEventListener('click', () => {
  console.log(role);
  joinModal.classList.add('bg-active');
});

closeJoinBtn.addEventListener('click', () => {
  joinModal.classList.remove('bg-active');
});

createRoomBtn.addEventListener('click', () => {
  getMeetingId();
  createModal.classList.add('bg-active');
  linkInput.setAttribute('value', meetId);
});

closeCreateBtn.addEventListener('click', () => {
  createModal.classList.remove('bg-active');
});

const getToken = async () => {
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
};

const TOKEN = getToken();
VideoSDK.config(TOKEN);
console.log(TOKEN);

let meetId;

const getMeetingId = async () => {
  const url = `${LOCAL_SERVER_URL}/create-meeting`;
  (async () => {
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    meetId = data.roomId;
    return data.roomId;
  })();
};

window.addEventListener('load', () => {
  const infoUrl = `${LOCAL_SERVER_URL}/profile`;
  (async function () {
    const res = await fetch(infoUrl, { method: 'GET' });
    const data = await res.json();
    userData.push(data.profile);
    getMeetingId();
  })();
});
