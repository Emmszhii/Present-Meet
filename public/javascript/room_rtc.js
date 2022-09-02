// initializing the variables
const userData = {};
const rtc = {
  localAudioTrack: null,
  localVideoTrack: null,
  client: null,
  localTracks: null,
};
const localTracks = [];
const remoteUsers = {};

// getting local user info
const getInfo = async () => {
  const url = `${AUTH_URL}/getInfo`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  return data;
};

// getting token and storing it in the userData
const getToken = async () => {
  getInfo().then(async (user) => {
    userData.fullName = user.user.fullName;
    userData.id = user.user.googleId;
    userData.sliceId = Number(user.user.googleId.slice(0, 4));
    const url = `${AUTH_URL}/rtc/${meetingId}/publisher/uid/${userData.sliceId}`;
    const res = await fetch(url, { method: 'GET' });
    await res.json().then((data) => {
      userData.APP_ID = data.AGORA_APP_ID;
      userData.token = data.rtcToken;
    });
  });
};

// initializing the agora sdk for joining the room and validating the user token for security joining
const joinRoomInit = async () => {
  rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  const id = userData.id.slice(0, 4);
  await rtc.client.join(
    userData.APP_ID,
    meetingId,
    userData.token,
    userData.sliceId
  );

  rtc.client.on('user-published', handleUserPublished);
  rtc.client.on('user-left', handleUserLeft);

  joinStream();
};

// joining the stream
const joinStream = async () => {
  rtc.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `
    <div class="video__container" id="user-container-${userData.sliceId}">
      <div class="video-player" id="user-${userData.sliceId}">
      </div>
      <div class="name">
        <p>${userData.fullName}</p>
      </div>
    </div>
  `;

  document
    .getElementById('streams__container')
    .insertAdjacentHTML('beforeend', player);
  document
    .getElementById(`user-container-${userData.sliceId}`)
    .addEventListener('click', expandVideoFrame);

  rtc.localTracks[1].play(`user-${userData.sliceId}`);

  await rtc.client.publish([rtc.localTracks[0], rtc.localTracks[1]]);
};

// user joined the meeting
const handleUserPublished = async (user, mediaType) => {
  // user is userData.sliceId
  remoteUsers[user.uid] = user;
  console.log(user);

  await rtc.client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);
  if (player === null) {
    player = `
    <div class="video__container" id="user-container-${user.uid}">
      <div class="video-player" id="user-${user.uid}">
      </div>
      <div class="name">
        <p>${user.fullName}</p>
      </div>
    </div>
  `;

    document
      .getElementById('streams__container')
      .insertAdjacentHTML('beforeend', player);
    document
      .getElementById(`user-container-${user.uid}`)
      .addEventListener('click', expandVideoFrame);
  }

  if (displayFrame.style.display) {
    player.style.width = `250px`;
    player.style.height = `150px`;
  }

  if (mediaType === 'video') {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
};

// user left the meeting
const handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();

  // if user is on big display and left delete it
  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName('video__container');

    // default size
    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.width = '300px';
      videoFrames[i].style.height = '200px';
    }
  }
};

// webpage on load
window.addEventListener('load', () => {
  videoLink.textContent = meetingId;
  getToken();
  setTimeout(joinRoomInit, 5000);
});
