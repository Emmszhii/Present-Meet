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

// const baseURL = `https://api.videosdk.live`;
const LOCAL_SERVER_URL = `http://localhost:3000`;

let idRoom;

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
};

// Random Code
function makeId(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
  idRoom = makeId(9);
  createModal.classList.add('bg-active');
  linkInput.setAttribute('value', idRoom);
});

closeCreateBtn.addEventListener('click', () => {
  disable();
  createModal.classList.remove('bg-active');
});

// // MEETING CODE
// const getMeetingId = async () => {
//   const url = `${LOCAL_SERVER_URL}/create-meeting`;
//   (async () => {
//     const res = await fetch(url, { method: 'GET' });
//     const data = await res.json();
//     idRoom = data.roomId;
//     roomId = data.id;
//     console.log(idRoom, roomId);
//     return data;
//   })();
// };

// // TOKEN GENERATOR
// async function tokenGeneration() {
//   try {
//     const response = await fetch(`${LOCAL_SERVER_URL}/get-token`, {
//       method: 'GET',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     });
//     const data = await response.json();
//     token = data.token;
//     console.log(token);
//     return token;
//   } catch (e) {
//     console.log(e);
//   }
// }

// Onload Webpage
window.addEventListener('load', () => {
  // getMeetingId();
  idRoom = makeId(9);
});
