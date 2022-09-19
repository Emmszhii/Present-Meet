import {
  preloader,
  recognizeHandler,
  startVideoHandler,
  photoHandler,
} from './face_recognition.js';

document
  .getElementById('recognize-btn')
  .addEventListener('click', recognizeHandler);
document
  .getElementById('camera-btn')
  .addEventListener('click', startVideoHandler);
document.getElementById('photo-btn').addEventListener('click', photoHandler);

window.addEventListener('load', () => {
  Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  ])
    .then(() => {})
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      preloader.style.display = 'none';
    });
});
