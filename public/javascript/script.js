const joinRoomBtn = document.getElementById('btnJoinModal');
const createRoomBtn = document.getElementById('btnCreateModal');
const joinModal = document.querySelector('.modalJoin-bg');
const createModal = document.querySelector('.modalCreate-bg');
const closeJoinBtn = document.querySelector('.modalJoin-close');
const closeCreateBtn = document.querySelector('.modalCreate-close');

joinRoomBtn.addEventListener('click', () => {
  joinModal.classList.add('bg-active');
});

closeJoinBtn.addEventListener('click', () => {
  joinModal.classList.remove('bg-active');
});

createRoomBtn.addEventListener('click', () => {
  createModal.classList.add('bg-active');
});

closeCreateBtn.addEventListener('click', () => {
  createModal.classList.remove('bg-active');
});
