const API_BASE_URL = 'https://api.videosdk.live';

const url = `http://localhost:3000`;

let token = '';

let btnCreateMeeting = document.getElementById('btnCreateMeeting');
let btnJoinMeeting = document.getElementById('btnJoinMeeting');
let videoContainer = document.getElementById('videoContainer');
let btnLeaveMeeting = document.getElementById('btnLeaveMeeting');
let btnToggleMic = document.getElementById('btnToggleMic');
let btnToggleWebCam = document.getElementById('btnToggleWebCam');

async function tokenValidation() {
  if (TOKEN != '') {
    token = TOKEN;
    console.log(token);
  } else if (url != '') {
    token = await window
      .fetch(url + '/get-token')
      .then(async (res) => {
        const { token } = await res.json();
        console.log(token);
        return token;
      })
      .catch(async (e) => {
        console.log(await e);
        return;
      });
  } else if (url == '' && TOKEN == '') {
    alert('Set Your configuration details first ');
    window.location.href = '/';
  } else {
    alert('PLEASE PROVIDE TOKEN FIRST');
  }
}

let meetingId = '';

async function meetingHandler(newMeeting) {
  console.log(token);
  let joinMeetingName = 'JS-SDK';

  //request permission for accessing media(mic/webcam)
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      console.log(stream);
    });

  //token validation
  tokenValidation();
  if (newMeeting) {
    const url = `${API_BASE_URL}/api/meetings`;
    const options = {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
    };

    const { meetingId } = await fetch(url, options)
      .then((response) => response.json())
      .catch((error) => alert('error', error));
    document.getElementById('lblMeetingId').value = meetingId;
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('grid-screen').style.display = 'inline-block';
    startMeeting(token, meetingId, joinMeetingName);
  } else {
    meetingId = document.getElementById('txtMeetingCode').value;
    document.getElementById('lblMeetingId').value = meetingId;
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('grid-screen').style.display = 'inline-block';
    startMeeting(token, meetingId, joinMeetingName);
  }
}

function startMeeting(token, meetingId, name) {
  // Meeting config
  window.VideoSDK.config(token);

  // Meeting Init
  meeting = window.VideoSDK.initMeeting({
    meetingId: meetingId, // required
    name: name, // required
    micEnabled: true, // optional, default: true
    webcamEnabled: true, // optional, default: true
    maxResolution: 'hd', // optional, default: "hd"
  });

  //join meeting
  meeting.join();

  //all remote participants
  participants = meeting.participants;

  //create Local Participant
  createParticipant(meeting.localParticipant.id);

  //local participant stream-enabled
  meeting.localParticipant.on('stream-enabled', (stream) => {
    setTrack(
      stream,
      localParticipant,
      localParticipantAudio,
      meeting.localParticipant.id
    );
  });

  //remote participant joined
  meeting.on('participant-joined', (participant) => {});

  //remote participants left
  meeting.on('participant-left', (participant) => {});

  addDomEvents();
}

function setTrack(stream, videoElem, audioElement, id) {}

//createParticipant
function createParticipant(participant) {
  //create videoElem of participant
  let participantVideo = createVideoElement(
    participant.id,
    participant.displayName
  );

  //create audioEle of participant
  let participantAudio = createAudioElement(participant.id);

  //append video and audio of participant to videoContainer div
  videoContainer.appendChild(participantVideo);
  videoContainer.appendChild(participantAudio);
}

// creating video element
function createVideoElement(id, name) {
  let videoFrame = document.createElement('div');
  videoFrame.classList.add('video-frame');

  //create video
  let videoElement = document.createElement('video');
  videoElement.classList.add('video');
  videoElement.setAttribute('id', `v-${id}`);
  videoElement.setAttribute('autoplay', true);
  videoFrame.appendChild(videoElement);

  //add overlay
  let overlay = document.createElement('div');
  overlay.classList.add('overlay');
  overlay.innerHTML = `Name : ${name}`;

  videoFrame.appendChild(overlay);
  return videoFrame;
}

// creating audio element
function createAudioElement(pId) {
  let audioElement = document.createElement('audio');
  audioElement.setAttribute('autoPlay', false);
  audioElement.setAttribute('playsInline', 'false');
  audioElement.setAttribute('controls', 'false');
  audioElement.setAttribute('id', `a-${pId}`);
  audioElement.style.display = 'none';
  return audioElement;
}

function startMeeting(token, meetingId, name) {
  //participant joined
  meeting.on('participant-joined', (participant) => {
    createParticipant(participant);
    participant.on('stream-enabled', (stream) => {
      console.log('Stream ENable : ', stream);
      setTrack(
        stream,
        document.querySelector(`#v-${participant.id}`),
        document.getElementById(`a-${participant.id}`),
        participant.id
      );
    });
  });

  // participants left
  meeting.on('participant-left', (participant) => {
    let vElement = document.querySelector(`#v-${participant.id}`);
    vElement.parentNode.removeChild(vElement);
    let aElement = document.getElementById(`a-${participant.id}`);
    aElement.parentNode.removeChild(aElement);
    participants = new Map(meeting.participants);
    //remove it from participant list participantId;
    document.getElementById(`p-${participant.id}`).remove();
  });
}

function setTrack(stream, videoElem, audioElement, id) {
  if (stream.kind == 'video') {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(stream.track);
    videoElem.srcObject = mediaStream;
    videoElem
      .play()
      .catch((error) =>
        console.error('videoElem.current.play() failed', error)
      );
  }
  if (stream.kind == 'audio') {
    if (id == meeting.localParticipant.id) return;
    const mediaStream = new MediaStream();
    mediaStream.addTrack(stream.track);
    audioElement.srcObject = mediaStream;
    audioElement
      .play()
      .catch((error) => console.error('audioElem.play() failed', error));
  }
}

function addDomEvents() {
  btnToggleMic.addEventListener('click', () => {
    if (btnToggleMic.innerText == 'Unmute Mic') {
      meeting.unmuteMic();
      btnToggleMic.innerText = 'Mute Mic';
    } else {
      meeting.muteMic();
      btnToggleMic.innerText = 'Unmute Mic';
    }
  });

  btnToggleWebCam.addEventListener('click', () => {
    if (btnToggleWebCam.innerText == 'Disable Webcam') {
      meeting.disableWebcam();
      btnToggleWebCam.innerText = 'Enable Webcam';
    } else {
      meeting.enableWebcam();
      btnToggleWebCam.innerText = 'Disable Webcam';
    }
  });

  btnLeaveMeeting.addEventListener('click', async () => {
    // leavemeeting
    meeting.leave();
    document.getElementById('join-screen').style.display = 'inline-block';
    document.getElementById('grid-screen').style.display = 'none';
  });
}
