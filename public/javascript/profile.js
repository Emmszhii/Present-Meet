const updateUser = async () => {
  const firstName = document.getElementById('first_name').value;
  const lastName = document.getElementById('last_name').value;
  const birthday = document.getElementById('birthday').value;
  const type = document.getElementById('user-type').value;
  const password = document.getElementById('password');
  const info = {
    first_name: firstName,
    last_name: lastName,
    birthday,
    type,
    password: password.value,
  };
  try {
    const resp = await fetch('/profile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(info),
    });
    const data = await resp.json();
    if (data.msg) {
      msgHandler(data.msg);
    } else {
      errorHandler(data.err);
    }
  } catch (e) {
    console.log(e);
  } finally {
    password.value = '';
    closeModal();
  }
};

const updatePassword = async () => {
  const oldPw = document.getElementById('change_password');
  const newPw = document.getElementById('change_password1');
  const confirmPw = document.getElementById('change_password2');
  const password = {
    password: oldPw.value,
    newPassword: newPw.value,
    newPassword1: confirmPw.value,
  };

  const resp = await fetch('/password', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(password),
  });
  const data = await resp.json();
  if (data.msg) {
    msgHandler(data.msg);
  } else {
    errorHandler(data.err);
  }
  closeModalChangePw();
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

const openModal = () => {
  const modal = document.getElementById('modal-confirm');
  modal.style.display = 'block';
};

const closeModal = () => {
  const modal = document.getElementById('modal-confirm');
  modal.style.display = 'none';
};

const openModalChangePw = () => {
  const modal = document.getElementById('modal-password');
  modal.style.display = 'block';
};

const closeModalChangePw = () => {
  const modal = document.getElementById('modal-password');
  modal.style.display = 'none';
};
// modals
document.getElementById('submit-btn').addEventListener('click', openModal);
document.getElementById('cancel').addEventListener('click', closeModal);
document
  .getElementById('change-pw')
  .addEventListener('click', openModalChangePw);
document
  .getElementById('cancel_change_pw')
  .addEventListener('click', closeModalChangePw);
// update info
document.getElementById('confirm').addEventListener('click', updateUser);
// change password
document
  .getElementById('change_pw_btn')
  .addEventListener('click', updatePassword);
