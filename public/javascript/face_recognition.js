const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
const video = document.getElementById('video');

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  // faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  // faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
]);
// console.log(faceapi.nets);

// UPLOADING IMAGE
const imgUploadHandler = async (e) => {
  const id = e.target.value;
  if (imgUpload.files[0]) {
    const image = await faceapi.bufferToImage(imgUpload.files[0]);
    addImgToDom(image, id);
    // createCanvas(image, id);
    detectFaces(image, id);
  } else {
    console.log(`no file`);
  }
};

const detectFaces = async (img) => {
  const detections = await faceapi
    .detectAllFaces(img)
    .withFaceLandmarks()
    .withFaceDescriptors();
  if (detections.length >= 2) {
    console.log(`you uploaded many faces please upload only one face`);
  } else {
    console.log(`ok`);
  }
};

const addImgToDom = (img, id) => {
  const container = document.getElementById('img-container');
  const imageExist = document.getElementsByTagName('img');
  if (imageExist[0]) {
    imageExist[0].remove();
  }
  img.width = 720;
  img.height = 480;
  img.id = id;
  container.append(img);
};

const createCanvas = (img, id) => {
  const container = document.getElementById('img-container');
  const canvas = document.createElement('canvas');
  const existCanvas = document.getElementsByTagName(`canvas`)[0];
  if (existCanvas) {
    existCanvas.remove();
  }
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.id = id;
  canvas.style.position = `absolute`;
  container.append(canvas);
};

// VIDEO HANDLER
const startVideoHandler = () => {
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.remove();
  }
  if ((video.style.display = 'none')) {
    video.style.display = 'block';
    canvas.style.display = 'none';
  } else {
  }
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
    video.play();
  });
};

const createVideoElement = () => {
  const video = document.createElement('video');
};

// PHOTO HANDLER
const photoHandler = async () => {
  // need to take a loader
  if ((video.style.display = 'block')) {
    context.imageSmoothingEnabled = false;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    console.log(ctx);
    // console.log(img);
    const id = document.getElementById('canvas');
    // face api detection
    const detection = await faceapi
      .detectSingleFace(id)
      .withFaceLandmarks()
      .withFaceDescriptor();
    console.log(detection);
    if (!detection) return stopVideo();
    drawCanvas(canvas, detection);

    // comparePerson(canvas, img);
  }
  stopVideo();
};

// stop video when capturing
const stopVideo = () => {
  if ((video.style.display = 'block')) {
    video.pause();
    video.currentTime = 0;
    video.style.display = 'none';
  } else {
    startVideo();
  }
};

const drawCanvas = async (input, detectionWithFaceLandMarks) => {
  // Init
  const container = document.createElement('canvas');
  container.style.position = 'absolute';
  container.id = 'overlay';
  const ctx = container.getContext('2d');
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

  // draw detections into canvas
  faceapi.draw.drawDetections(canvas_overlay, resizedResults);
};

// recognize handler
const recognizeHandler = async () => {
  const img1 = document.getElementsByTagName('img')[0];
  const img2 = document.getElementsByTagName('canvas')[0];

  // guard clause
  if (!img1) return console.log(`img1 err`);
  if (!img2) return console.log(`img2 err`);
  // many face
  // const result1 = await faceapi
  //   .detectAllFaces(img1)
  //   .withFaceLandmarks()
  //   .withFaceDescriptors();
  // // console.log(result1[0]);
  // // console.log(img1, img2);

  // const result2 = await faceapi
  //   .detectAllFaces(img2)
  //   .withFaceLandmarks()
  //   .withFaceDescriptors();

  // if (result1.length > 1) return console.log(`error to many faces`);

  comparePerson(img1, img2);
  console.log(`success`);
};

const comparePerson = async (referenceImg, queryImg) => {
  // one face
  const result = await faceapi
    .detectSingleFace(referenceImg)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return console.log(`no result`);

  const labeledDescriptors = [
    new faceapi.LabeledFaceDescriptors('Emms', [result.descriptor]),
    new faceapi.LabeledFaceDescriptors('Emms', [result.descriptor]),
    new faceapi.LabeledFaceDescriptors('Emms', [result.descriptor]),
    new faceapi.LabeledFaceDescriptors('Emms', [result.descriptor]),
  ];

  // matching A reference
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

  // single face
  const singleResult = await faceapi
    .detectSingleFace(queryImg)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (singleResult) {
    // matching B query
    const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
    console.log(bestMatch);
    console.log(bestMatch.distance);
    console.log(bestMatch.toString());
  } else {
    console.log(`no single result`);
  }
};

const getUserCameraDevices = () => {
  return navigator.mediaDevices.enumerateDevices().then((devices) => {
    console.log(devices);
    return devices.filter((item) => item.kind === 'videoinput');
  });
};

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

document
  .getElementById('recognize-btn')
  .addEventListener('click', recognizeHandler);
document
  .getElementById('imgUpload')
  .addEventListener('change', imgUploadHandler);
document
  .getElementById('camera-btn')
  .addEventListener('click', startVideoHandler);
document
  .getElementById('attendance-btn')
  .addEventListener('click', photoHandler);
