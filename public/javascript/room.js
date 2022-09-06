// For logging errors in agora set 3 for warnings and error to be log at console set 1 to log it all.
AgoraRTC.setLogLevel(3);

// Initializing variables
// getting meeting Link
const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();

// Expand Video Frame on Click
let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
let userIdInDisplayFrame = null;

// Expand VideoFrame Function
const expandVideoFrame = (e) => {
  let child = displayFrame.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget);
  userIdInDisplayFrame = e.currentTarget.id;

  resetTheFrames();
};

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener('click', expandVideoFrame);
}

// Hide Display Frame Function
const hideDisplayFrame = () => {
  userIdInDisplayFrame = null;
  displayFrame.style.display = null;

  let child = displayFrame.children[0];
  document.getElementById('streams__container').appendChild(child);

  resetTheFrames();
};

const resetTheFrames = () => {
  const videoFrames = document.getElementsByClassName('video__container');
  for (let i = 0; videoFrames.length > i; i++) {
    videoFrames[i].style.width = '300px';
    videoFrames[i].style.height = '200px';
  }
};

// Copy Meeting ID function
const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};

// message and participant toggle

function messagesToggle(e) {
  const btn = e.currentTarget;
  const x = document.getElementById('messages__container');
  const y = document.getElementById('members__container');
  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    btn.classList.add('active');
    x.style.display = 'block';
  }
}

function membersToggle(e) {
  const btn = e.currentTarget;
  const x = document.getElementById('members__container');
  const y = document.getElementById('messages__container');
  if (y.style.display === 'block') return;
  if (x.style.display === 'block') {
    btn.classList.remove('active');
    x.style.display = 'none';
  } else {
    btn.classList.add('active');
    x.style.display = 'block';
  }
}

export {
  displayFrame,
  userIdInDisplayFrame,
  videoFrames,
  meetingId,
  membersToggle,
  messagesToggle,
  copyClipboard,
  resetTheFrames,
  hideDisplayFrame,
  expandVideoFrame,
};
