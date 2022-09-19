const preloader = document.getElementById('preloader');
const camera = document.querySelector('.attendance-camera');
let track;
const refUser = [];

// VIDEO HANDLER
const startVideoHandler = async () => {
  preloader.style.display = 'block';
  const vid = document.createElement('video');
  vid.id = 'video';
  vid.autoplay = false;
  vid.muted = true;

  const submit = document.getElementById('submit-btn');
  if (submit) {
    submit.remove();
  }
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.remove();
  }
  const canvas = document.getElementById('canvas');
  if (canvas) {
    canvas.remove();
  }
  const video = document.getElementById('video');
  if (!video) {
    camera.insertBefore(vid, camera.firstChild);
  }
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    const vid = document.getElementById('video');
    vid.srcObject = stream;
    vid.play();
    track = stream.getTracks();
    resetMessages();
    preloader.style.display = 'none';
  });
};

// PHOTO HANDLER
const photoHandler = async () => {
  preloader.style.display = 'block';
  const video = document.getElementById('video');
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.width = '1920';
  canvas.height = '1080';
  const context = canvas.getContext('2d');
  const canvasDom = document.getElementById('canvas');
  if (!canvasDom) camera.append(canvas);

  // need to take a loader
  try {
    if (video) {
      context.imageSmoothingEnabled = false;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const id = document.getElementById('canvas');

      // face api detection
      const detection = await faceapi
        .detectAllFaces(id)
        .withFaceLandmarks()
        .withFaceDescriptors();

      // if no detection
      if (!detection || detection.length > 1) {
        stopVideo();
        errorHandler('Image are invalid. Please Try again!');
        return startVideoHandler();
      }
      // stop video play
      stopVideo();
      // reset array
      refUser.length = [];
      // input user array
      refUser.push(detection);
      // if face is detected
      drawCanvas(canvas);
    } else {
      errorHandler('Start the camera first!');
    }
  } catch (err) {
    console.log(err);
  }
  preloader.style.display = 'none';
};

// stop video when capturing
const stopVideo = () => {
  const video = document.getElementById('video');
  if (video) {
    track[0].stop();
    video.remove();
  } else {
    startVideo();
  }
};

const resetMessages = () => {
  const err = document.getElementById('err');
  const msg = document.getElementById('msg');
  if (err) err.remove();
  if (msg) msg.remove();
};

// recognize handler
const recognizeHandler = async () => {
  const video = document.getElementById('video');
  if (refUser.length === 0) {
    return errorHandler('No Reference Image !');
  }
  const img1 = refUser[0];
  let img2;

  // create Canvas
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  canvas.width = '1920';
  canvas.height = '1080';
  const context = canvas.getContext('2d');
  const canvasDom = document.getElementById('canvas');
  if (!canvasDom) camera.append(canvas);

  if (video) {
    context.imageSmoothingEnabled = false;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const id = document.getElementById('canvas');

    // face api detection
    const detection = await faceapi
      .detectAllFaces(id)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // if no detection
    if (!detection || detection.length > 1) {
      stopVideo();
      return startVideoHandler();
    }

    img2 = detection[0];
    stopVideo();
    // guard clause
    if (!img1[0]) {
      return errorHandler(`no image 1`);
    }
    if (!img2) return errorHandler(`no image 2`);
    // comparing the 2 image
    comparePerson(img1[0], img2);
  } else {
    errorHandler('Start the camera first!');
  }
};

const errorHandler = (err) => {
  const msg = document.getElementById('msg');
  if (msg) {
    msg.remove();
  }
  const p = document.createElement('p');
  p.textContent = err;
  p.id = 'err';

  const errP = document.getElementById('err');
  if (errP) {
    errP.innerText = err;
  } else {
    document.getElementById('messages').appendChild(p);
  }
};

const msgHandler = (msg) => {
  const err = document.getElementById('err');
  if (err) {
    err.remove();
  }
  const p = document.createElement('p');
  p.textContent = msg;
  p.id = 'msg';

  const msgP = document.getElementById('msg');
  if (msgP) {
    msgP.innerText = msg;
  } else {
    document.getElementById('messages').appendChild(p);
  }
};

// compare the person
const comparePerson = async (referenceImg, queryImg) => {
  // guard clause if input is null
  if (!referenceImg) return errorHandler('Please register an image first');
  if (!queryImg) return errorHandler('Query img is invalid');
  // if both are defined run the face recognition
  if (queryImg) {
    // matching B query
    const dist = faceapi.euclideanDistance(
      referenceImg.descriptor,
      queryImg.descriptor
    );
    if (dist <= 0.4) {
      msgHandler(
        `Image 1 and image 2 are match, you can retry recognizing it if you're satisfied then you can now save it!`
      );
      createPostButton();
    } else {
      errorHandler('Image 1 and image 2 are NOT match Please Try again!');
    }
  } else {
    errorHandler('No face detected for recognizing the user!');
  }
};

const createPostButton = async () => {
  const buttons = document.querySelector('.buttons');
  const button = document.createElement('button');
  button.classList.add('button');
  button.innerHTML = 'Submit';
  button.id = 'submit-btn';

  buttons.append(button);
  button.addEventListener('click', showConfirm);
  // button.addEventListener('click', postToServer);
};

const showConfirm = () => {
  const modal = document.getElementById('modal-confirm');
  const confirmBtn = document.getElementById('confirm');

  modal.style.display = 'block';

  confirmBtn.addEventListener('click', postToServer);
};

const postToServer = async (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  document.getElementById('modal-confirm').style.display = 'none';
  try {
    const id = refUser[0];
    const descriptor = id[0].descriptor.toString();

    const response = await fetch(`/descriptor`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ descriptor, password }),
    });
    const data = await response.json();
    console.log(response);
    console.log(data);
    if (response.status === 200) {
      if (data.msg) {
        return msgHandler(data.msg);
      } else {
        return errorHandler(data.err);
      }
    } else {
      return errorHandler(data.err);
    }
  } catch (err) {
    return errorHandler(err);
  }
};

const drawCanvas = async (input) => {
  // Init
  preloader.style.display = 'block';
  const container = document.createElement('canvas');
  container.style.position = 'absolute';
  container.id = 'overlay';
  document.querySelector('.attendance-camera').appendChild(container);

  // camera default size
  const displaySize = { width: input.width, height: input.height };
  const canvas_overlay = document.getElementById('overlay');
  faceapi.matchDimensions(canvas_overlay, displaySize);

  // display face landmarks
  const detectionWithLandmarks = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks();

  // resized the detected boxes and landmarks
  const resizedResults = faceapi.resizeResults(
    // detectionWithFaceLandMarks,
    detectionWithLandmarks,
    displaySize
  );
  // draw the landmarks into the canvas
  faceapi.draw.drawFaceLandmarks(canvas_overlay, resizedResults);

  // draw detections points into canvas
  faceapi.draw.drawDetections(canvas_overlay, resizedResults);
  msgHandler(
    'If you are satisfied with this photo try to recognize else retry'
  );
  preloader.style.display = 'none';
};

// const getUserCameraDevices = () => {
//   return navigator.mediaDevices.enumerateDevices().then((devices) => {
//     console.log(devices);
//     return devices.filter((item) => item.kind === 'videoinput');
//   });
// };

// getUserCameraDevices().then((i) => createSelectElement('Video', i));

// const createSelectElement = (name, val) => {
//   // dynamic select
//   const select = document.createElement('select');
//   select.name = name;
//   select.id = name;
//   for (let i = 0; val.length > i; i++) {
//     const option = document.createElement('option');
//     option.value = val[i].label;
//     option.text = val[i].label;
//     select.appendChild(option);
//   }

//   const label = document.createElement('label');
//   label.id = name;
//   label.innerHTML = name;
//   label.htmlFor = name;

//   document.getElementById('devices').appendChild(label).appendChild(select);
// };

export {
  preloader,
  camera,
  track,
  refUser,
  startVideoHandler,
  photoHandler,
  stopVideo,
  resetMessages,
  recognizeHandler,
  errorHandler,
  msgHandler,
  comparePerson,
  createPostButton,
  postToServer,
  drawCanvas,
};
