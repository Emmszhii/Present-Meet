const joinRoomBtn = document.getElementById('btnJoinModal');
const createRoomBtn = document.getElementById('btnCreateModal');
const joinModal = document.querySelector('.modalJoin-bg');
const createModal = document.querySelector('.modalCreate-bg');
const closeJoinBtn = document.querySelector('.modalJoin-close');
const closeCreateBtn = document.querySelector('.modalCreate-close');
const linkInput = document.getElementById('link');

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
  joinModal.classList.add('bg-active');
});

closeJoinBtn.addEventListener('click', () => {
  joinModal.classList.remove('bg-active');
});

createRoomBtn.addEventListener('click', () => {
  createModal.classList.add('bg-active');
  const linkID = generateString(9);
  linkInput.setAttribute('value', linkID);
});

closeCreateBtn.addEventListener('click', () => {
  createModal.classList.remove('bg-active');
});
