let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');
let video = document.getElementById('video');

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
]);
// console.log(faceapi.nets);

const startVideo = () => {
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

const takePhoto = async () => {
  // need to take a loader
  if ((video.style.display = 'block')) {
    context.imageSmoothingEnabled = false;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';

    // face api
    const detectionWithFaceLandMarks = await faceapi
      .detectSingleFace('canvas', new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detectionWithFaceLandMarks) return stopVideo();

    drawCanvas(canvas, detectionWithFaceLandMarks);

    // console.log(detectionWithFaceLandMarks);
  } else {
    stopVideo();
  }
};

const stopVideo = () => {
  if ((video.style.display = 'block')) {
    video.pause();
    video.currentTime = 0;
    video.style.display = 'none';
    document.getElementById('overlay').remove();
  }
};

const drawCanvas = async (input, detectionWithFaceLandMarks) => {
  // Init
  const container = document.createElement('canvas');
  container.style.position = 'absolute';
  container.id = 'overlay';
  const ctx = container.getContext('2d');
  console.log(ctx);
  document.getElementById('video-container').append(container);

  const displaySize = { width: input.width, height: input.height };
  const canvas_overlay = document.getElementById('overlay');
  faceapi.matchDimensions(canvas_overlay, displaySize);
  //
  // display bounding boxes
  // const detections = await faceapi.detectSingleFace(input);
  // const resizedDetections = faceapi.resizeResults(detections, displaySize);
  // faceapi.draw.drawDetections(canvas_overlay, resizedDetections);
  //
  // display face landmarks
  const detectionWithLandmarks = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks();
  // resized the detected boxes and landmarks
  const resizedResults = faceapi.resizeResults(
    detectionWithFaceLandMarks,
    // detectionWithLandmarks,
    displaySize
  );
  // draw the landmarks into the canvas
  faceapi.draw.drawFaceLandmarks(canvas_overlay, resizedResults);

  // draw detections into canvas
  faceapi.draw.drawDetections(canvas_overlay, resizedResults);

  // const detectionsWithLandmarksForSize = faceapi.resizeResults(
  //   detectionWithFaceLandMarks,
  //   {
  //     width: canvas.width,
  //     height: canvas.height,
  //   }
  // );
  // const canvas_overlay = document.createElement('canvas');
  // canvas_overlay.width = canvas.width;
  // canvas_overlay.height = canvas.height;
  // document
  //   .getElementById('video-container')
  //   .insertAdjacentHTML('beforeend', canvas_overlay);
  // faceapi.drawLandmarks(canvas_overlay, detectionsWithLandmarksForSize, {
  //   drawLines: true,
  // });
};

document.getElementById('camera-btn').addEventListener('click', startVideo);
document.getElementById('attendance-btn').addEventListener('click', takePhoto);
