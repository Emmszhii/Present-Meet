// initializing the variables
const userData = {};
const rtc = {
  // rtc.client
  client: null,
  // rtc local audio
  localAudioTrack: null,
  // rtc local video
  localVideoTrack: null,
  // rtc local tracks
  localTracks: null,
  // rtc local screen track
  localScreenTracks: null,
  // rtc boolean screen share
  sharingScreen: false,
};
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
  // initialize local tracks
  rtc.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
    {},
    {
      encoderConfig: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
      },
    }
  );

  // user DOM
  const player = `
    <div class="video__container" id="user-container-${userData.sliceId}">
      <div class="video-player" id="user-${userData.sliceId}">
      </div>
      <div class="name">
        <p>${userData.fullName}</p>
      </div>
    </div>
  `;

  // add the player into the DOM
  document
    .getElementById('streams__container')
    .insertAdjacentHTML('beforeend', player);
  document
    .getElementById(`user-container-${userData.sliceId}`)
    .addEventListener('click', expandVideoFrame);

  // play the local video track of the user
  rtc.localTracks[1].play(`user-${userData.sliceId}`);

  // publish the video for other users to see
  await rtc.client.publish([rtc.localTracks[0], rtc.localTracks[1]]);
};

// user joined the meeting
const handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  console.log(user);

  // subscribe to the meeting
  await rtc.client.subscribe(user, mediaType);

  // add frame to the dom
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

  // if big screen is true let the other users resize their screen
  if (displayFrame.style.display) {
    let videoFrame = document.getElementById(`user-container-${user.uid}`);
    videoFrame.style.width = `250px`;
    videoFrame.style.height = `150px`;
  }

  // if media is VIDEO play their video in stream container
  if (mediaType === 'video') {
    user.videoTrack.play(`user-${user.uid}`);
  }

  // if media is AUDIO play their audio
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

// Buttons
// Camera function
const toggleCamera = async (e) => {
  const button = e.currentTarget;

  if (rtc.localTracks[1].muted) {
    await rtc.localTracks[1].setMuted(false);
    button.classList.add('active');
  } else {
    await rtc.localTracks[1].setMuted(true);
    button.classList.remove('active');
  }
};
// Audio function
const toggleMic = async (e) => {
  const button = e.currentTarget;

  if (rtc.localTracks[0].muted) {
    await rtc.localTracks[0].setMuted(false);
    button.classList.add('active');
  } else {
    await rtc.localTracks[0].setMuted(true);
    button.classList.remove('active');
  }
};

// Screen function
const toggleScreen = async (e) => {
  const screenButton = e.currentTarget;
  const cameraButton = document.getElementById('camera-btn');

  if (!rtc.sharingScreen) {
    rtc.localScreenTracks = await AgoraRTC.createScreenVideoTrack()
      .then(async () => {
        rtc.sharingScreen = true;
        screenButton.classList.add('active');
        cameraButton.classList.remove('active');
        cameraButton.style.display = 'none';

        document.getElementById(`user-container-${userData.sliceId}`).remove();
        displayFrame.style.display = ' block';

        let player = `
        <div class="video__container" id="user-container-${userData.sliceId}">
          <div class="video-player" id="user-${userData.sliceId}">
          </div>
        </div>
      `;

        displayFrame.insertAdjacentHTML('beforeend', player);
        document
          .getElementById(`user-container-${userData.sliceId}`)
          .addEventListener('click', expandVideoFrame);

        userIdInDisplayFrame = `user-container-${userData.sliceId}`;
        rtc.localScreenTracks.play(`user-${userData.sliceId}`);

        await rtc.client.unpublish([rtc.localTracks[1]]);
        await rtc.client.publish([rtc.localScreenTracks]);

        const videoFrames = document.getElementsByClassName(`video__container`);
        for (let i = 0; videoFrames.length > i; i++) {
          if (videoFrames[i].id != userIdInDisplayFrame) {
            videoFrames[i].style.width = '250px';
            videoFrames[i].style.height = '150px';
          }
        }
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  } else {
    rtc.sharingScreen = false;
    cameraButton.style.display = 'block';
    document.getElementById(`user-container-${userData.sliceId}`).remove();
    await rtc.client.unpublish([rtc.localScreenTracks]);

    switchToCamera();
  }
};

// After disabling the share screen function then switch to Camera
const switchToCamera = async () => {
  const player = `
    <div class="video__container" id="user-container-${userData.sliceId}">
      <div class="video-player" id="user-${userData.sliceId}">
      </div>
      <div class="name">
        <p>${userData.fullName}</p>
      </div>
    </div>
  `;

  displayFrame.insertAdjacentHTML('beforeend', player);

  await rtc.localTracks[0].setMuted(true);
  await rtc.localTracks[1].setMuted(true);

  document.getElementById(`mic-btn`).classList.remove('active');
  document.getElementById(`screen-btn`).classList.remove('active');

  rtc.localTracks[1].play(`user-${userData.sliceId}`);
  await rtc.client.publish([rtc.localTracks[1]]);
};

// Camera Button
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
// Mic Button
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('screen-btn').addEventListener('click', toggleScreen);

// webpage on load
window.addEventListener('load', () => {
  videoLink.textContent = meetingId;
  getToken();
  setTimeout(joinRoomInit, 5000);
});
