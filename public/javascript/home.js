// initializing the variables
// const joinRoomBtn = document.getElementById('btnJoinModal');
// const createRoomBtn = document.getElementById('btnCreateModal');
// const joinModal = document.querySelector('.modalJoin-bg');
// const createModal = document.querySelector('.modalCreate-bg');
// const closeJoinBtn = document.querySelector('.modalJoin-close');
// const closeCreateBtn = document.querySelector('.modalCreate-close');
const linkInput = document.getElementById('link');
const joinMeetingInput = document.getElementById('txtMeetingCode');
// const joinVideoBox = document.getElementById('videoCheckbox1');
// const joinAudioBox = document.getElementById('micCheckbox1');
// const createVideoBox = document.getElementById('videoCheckbox2');
// const createAudioBox = document.getElementById('micCheckbox2');

// const LOCAL_SERVER_URL = `http://localhost:3000`;

// let idRoom for random id generator
let idRoom;

// Random room id generator Code
function makeId(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
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

// Event Listeners

// MODAL for joining and creating room
// joinRoomBtn.addEventListener('click', () => {
//   joinModal.classList.add('bg-active');
//   document.getElementById('txtMeetingCode').focus();
// });

// closeJoinBtn.addEventListener('click', () => {
//   joinMeetingInput.value = '';
//   joinModal.classList.remove('bg-active');
// });

// createRoomBtn.addEventListener('click', () => {
//   idRoom = makeId(9);
//   createModal.classList.add('bg-active');
//   linkInput.setAttribute('value', idRoom);
// });

// closeCreateBtn.addEventListener('click', () => {
//   createModal.classList.remove('bg-active');
// });

const modalJoin = document.getElementById('modal-join');
const modalCreate = document.getElementById('modal-create');
const xJoinModal = document.getElementsByClassName('close-join-modal')[0];
const xCreateModal = document.getElementsByClassName('close-create-modal')[0];

const showJoinModal = () => {
  modalJoin.style.display = 'block';
  document.getElementById('txtMeetingCode').focus();
};

const closeJoinModal = () => {
  modalJoin.style.display = 'none';
  joinMeetingInput.value = '';
};

const showCreateModal = () => {
  idRoom = makeId(9);
  modalCreate.style.display = 'block';
  linkInput.setAttribute('value', idRoom);
};
const closeCreateModal = () => {
  modalCreate.style.display = 'none';
};

document
  .getElementById('btn-join-modal')
  .addEventListener('click', showJoinModal);
document
  .getElementById('btn-create-modal')
  .addEventListener('click', showCreateModal);

xJoinModal.addEventListener('click', closeJoinModal);
xCreateModal.addEventListener('click', closeCreateModal);

window.addEventListener('load', () => {
  idRoom = makeId(9);
});

window.onclick = (e) => {
  if (e.target === modalJoin) {
    modalJoin.style.display = 'none';
  }
  if (e.target === modalCreate) {
    modalCreate.style.display = 'none';
  }
};

document.addEventListener('keydown', (e) => {
  if ((modalJoin.style.display = 'block')) {
    closeJoinModal();
  }
  if ((modalCreate.style.display = 'block')) {
    closeCreateModal();
  }
});
