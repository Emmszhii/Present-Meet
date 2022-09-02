// initializing the variables
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

const LOCAL_SERVER_URL = `http://localhost:3000`;

// let idRoom for random id generator
let idRoom;

joinVideoBox.addEventListener('click', (e) => {
  e.target.checked
    ? (e.currentTarget.value = true)
    : (e.currentTarget.value = false);
});
joinAudioBox.addEventListener('click', (e) => {
  e.target.checked
    ? (e.currentTarget.value = true)
    : (e.currentTarget.value = false);
});
createVideoBox.addEventListener('click', (e) => {
  e.target.checked
    ? (e.currentTarget.value = true)
    : (e.currentTarget.value = false);
});
createAudioBox.addEventListener('click', (e) => {
  e.target.checked
    ? (e.currentTarget.value = true)
    : (e.currentTarget.value = false);
});

// disable the video and audio checkbox
const disable = () => {
  joinVideoBox.checked = false;
  joinAudioBox.checked = false;
  createVideoBox.checked = false;
  createAudioBox.checked = false;
};

// Random room id generator Code
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

// MODAL for joining and creating room
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

// Onload Webpage
window.addEventListener('load', () => {
  idRoom = makeId(9);
});
