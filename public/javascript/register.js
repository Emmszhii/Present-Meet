const form = document.getElementById('user-info');
const submit_btn = document.getElementById('submit-btn');
const user_type = document.getElementById('user-type');

const AUTH_URL = 'http://localhost:3000';

// const userTypeChanged = (e) => {
//   const type = e.target.value;
//   const user_face = document.getElementById('user-face');
//   const form = document.getElementById('form');
//   if (type === 'teacher' || type === 'host') {
//     user_face.style.display = 'none';
//   } else {
//     user_face.style.display = 'flex';
//   }
// };

// user_type.addEventListener('change', userTypeChanged);

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const resp = await fetch(url + 'register', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: {},
//   });
// });

const constraint = {
  video: {},
};

const handleFaceRecognition = () => {};
