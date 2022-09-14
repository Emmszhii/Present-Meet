let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');
let video = document.getElementById('video');

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

const takePhoto = () => {
  if ((video.style.display = 'block')) {
    context.imageSmoothingEnabled = false;
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
      // canvas.width,
      // canvas.height
      // video.width * window.devicePixelRatio,
      // video.height * window.devicePixelRatio
    );
    canvas.style.display = 'block';
    stopVideo();
  }
};

const stopVideo = () => {
  if ((video.style.display = 'block')) {
    video.pause();
    video.currentTime = 0;
    video.style.display = 'none';
  }
};
document.getElementById('camera-btn').addEventListener('click', startVideo);
document.getElementById('attendance-btn').addEventListener('click', takePhoto);
