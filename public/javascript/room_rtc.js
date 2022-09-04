// initializing the variables

// user local data and tokens
const userData = {};

// rtc API
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

// rtm API
const rtm = {
  // rtm.client
  client: null,
  channel: null,
};
const rtmOption = {
  token: '',
  uid: '',
};

// remote users
const remoteUsers = {};

// getting local user info
const getInfo = async () => {
  const url = `${AUTH_URL}/getInfo`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json().catch((err) => console.log(err));
  return data;
};

// getting token and storing it in the userData
const getTokens = async () => {
  // User Information 1st
  getInfo().then(async (user) => {
    userData.fullName = user.user.fullName;
    userData.id = user.user.googleId;
    userData.rtcId = user.user.googleId.slice(0, 4);
    userData.rtmId = user.user.googleId.slice(0, 5);
    // then Rtc Token
    const url = `${AUTH_URL}/rtc/${meetingId}/publisher/uid/${userData.rtcId}`;
    const res = await fetch(url, { method: 'GET' });
    await res
      .json()
      .then(async (data) => {
        userData.APP_ID = data.AGORA_APP_ID;
        userData.rtcToken = data.rtcToken;
        // then Rtm Token
        const url = `${AUTH_URL}/rtm/${userData.rtmId}`;
        const res = await fetch(url, { method: 'GET' });
        await res.json().then((data) => {
          userData.rtmToken = data.rtmToken;
          console.log(userData);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

// initializing the agora sdk for joining the room and validating the user token for security joining
const joinRoomInit = async () => {
  // letting rtc.client become the instance with APP_ID
  rtm.client = await AgoraRTM.createInstance(userData.APP_ID);

  // option to login into RTM
  const rtmOption = {
    uid: userData.rtmId,
    token: userData.rtmToken,
  };

  // login to the rtm with user id and rtmToken
  await rtm.client.login(rtmOption);

  // create client with meetingId
  rtm.channel = await rtm.client.createChannel(meetingId);
  // join RTM
  await rtm.channel.join();

  // initialize setting the rtc
  rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  // join rtc with the params info
  await rtc.client.join(
    userData.APP_ID,
    meetingId,
    userData.rtcToken,
    userData.rtcId
  );

  // on user publish and left method
  rtc.client.on('user-published', handleUserPublished);
  rtc.client.on('user-left', handleUserLeft);

  // join stream functions
  joinStream();
};

// joining the stream
const joinStream = async () => {
  // initialize local tracks
  rtc.localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(
    {},
    {
      // encoderConfig: {
      //   width: { min: 640, ideal: 1920, max: 1920 },
      //   height: { min: 480, ideal: 1080, max: 1080 },
      // },
    }
  );

  // user DOM
  const player = `
    <div class="video__container" id="user-container-${userData.rtcId}">
      <div class="video-player" id="user-${userData.rtcId}">
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
    .getElementById(`user-container-${userData.rtcId}`)
    .addEventListener('click', expandVideoFrame);

  // play the local video track of the user
  rtc.localTracks[1].play(`user-${userData.rtcId}`);

  // publish the video for other users to see
  // localTracks[1] for audio and localTracks[0] for the video
  await rtc.client.publish([rtc.localTracks[1]]);
  // rtc.localTracks[0],
};

// user joined the meeting handler
const handleUserPublished = async (user, mediaType) => {
  // set remote users as user
  remoteUsers[user.uid] = user;
  console.log(user);

  // subscribe to the meeting
  await rtc.client.subscribe(user, mediaType);

  // creating let variable for rendering other user
  let player = document.getElementById(`user-container-${user.uid}`);
  // if player is null then run it
  if (player === null) {
    player = `
    <div class="video__container" id="user-container-${user.uid}">
      <div class="video-player" id="user-${user.uid}">
      </div>
      <div class="name">
        <p>${user.uid}</p>
      </div>
    </div>
  `;

    // add player to the dom
    document
      .getElementById('streams__container')
      .insertAdjacentHTML('beforeend', player);
    //onClick user will be able to expand it
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
  // delete a remote user with their uid
  delete remoteUsers[user.uid];
  // delete the dom of the user uid who left
  document.getElementById(`user-container-${user.uid}`).remove();

  // if user is on big display and left delete it
  if (userIdInDisplayFrame === `user-container-${user.uid}`) {
    displayFrame.style.display = null;

    // videoFrames variable
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
  // button target
  const button = e.currentTarget;

  // rtc video muting
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
  // button target
  const button = e.currentTarget;

  // rtc audio muting
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
  // button target
  const screenButton = e.currentTarget;
  // camera button
  const cameraButton = document.getElementById('camera-btn');

  // if rtc sharing screen is false
  if (!rtc.sharingScreen) {
    // run rtc localScreenTracks
    rtc.localScreenTracks = await AgoraRTC.createScreenVideoTrack().catch(
      (err) => {
        // if error occurs reset the buttons and rtc sharingScreen boolean
        rtc.sharingScreen = false;
        cameraButton.style.display = 'block';
        return;
      }
    );

    // if it run
    try {
      // setting the active buttons
      rtc.sharingScreen = true;
      screenButton.classList.add('active');
      cameraButton.classList.remove('active');
      cameraButton.style.display = 'none';

      // remove the local video screen
      document.getElementById(`user-container-${userData.rtcId}`).remove();
      displayFrame.style.display = ' block';

      // player variable for their screen
      let player = `
        <div class="video__container" id="user-container-${userData.rtcId}">
          <div class="video-player" id="user-${userData.rtcId}">
          </div>
        </div>
      `;

      // display in big frame the player dom
      displayFrame.insertAdjacentHTML('beforeend', player);
      document
        .getElementById(`user-container-${userData.rtcId}`)
        .addEventListener('click', expandVideoFrame);

      //
      userIdInDisplayFrame = `user-container-${userData.rtcId}`;
      rtc.localScreenTracks.play(`user-${userData.rtcId}`);

      // unpublish the video track
      await rtc.client.unpublish([rtc.localTracks[1]]);
      // publish the screen track
      await rtc.client.publish([rtc.localScreenTracks]);

      // video__container
      let videoFrames = document.getElementsByClassName(`video__container`);

      // reset the frames
      for (let i = 0; videoFrames.length > i; i++) {
        if (videoFrames[i].id != userIdInDisplayFrame) {
          videoFrames[i].style.width = '250px';
          videoFrames[i].style.height = '150px';
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      // reset the values to false
      rtc.sharingScreen = false;
      cameraButton.style.display = 'block';

      // remove the local screen tracks to the dom
      document.getElementById(`user-container-${userData.rtcId}`).remove();

      //unpublish the local screen tracks
      await rtc.client.unpublish([rtc.localScreenTracks]);

      // then switch to camera
      switchToCamera();
    } catch (err) {
      console.log(err);
    }
  }
};

// After disabling the share screen function then switch to Camera
const switchToCamera = async () => {
  // player DOM
  let player = `
    <div class="video__container" id="user-container-${userData.rtcId}">
      <div class="video-player" id="user-${userData.rtcId}">
      </div>
      <div class="name">
        <p>${userData.rtcId}</p>
      </div>
    </div>
  `;

  // display the frame
  displayFrame.insertAdjacentHTML('beforeend', player);

  // mute the local tracks of the user
  await rtc.localTracks[0].setMuted(true);
  await rtc.localTracks[1].setMuted(true);

  // removing the active class
  document.getElementById(`mic-btn`).classList.remove('active');
  document.getElementById(`screen-btn`).classList.remove('active');

  // play the user video
  rtc.localTracks[1].play(`user-${userData.rtcId}`);

  // publish the video
  await rtc.client.publish([rtc.localTracks[1]]);
};

// Event Listeners

// Camera Button
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
// Mic Button
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('screen-btn').addEventListener('click', toggleScreen);

// webpage on load
window.addEventListener('load', () => {
  // display the meeting link
  videoLink.textContent = meetingId;
  // get tokens and user info
  getTokens();
  // need 3 seconds to run because of fetching the info and tokens
  setTimeout(joinRoomInit, 3000);
});
