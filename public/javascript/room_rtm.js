import { userData, rtm, player } from './room_rtc.js';
import { faceRecognitionHandler } from './room_face_recognition.js';
import {
  userIdInDisplayFrame,
  displayFrame,
  resetTheFrames,
  expandVideoFrame,
  hideDisplayFrame,
} from './room.js';

// get members names and total and add it to the dom;
// member joining handler
const handleMemberJoin = async (MemberId) => {
  // console.log('A new member has joined the room', MemberId);
  addMemberToDom(MemberId);

  // update the participants total
  const members = await rtm.channel.getMembers();
  updateMemberTotal(members);

  const { name } = await rtm.client.getUserAttributesByKeys(MemberId, ['name']);
  addBotMessageToDom(`Welcome to the room ${name}! 🤗`);
};

// add member dom when user join
const addMemberToDom = async (MemberId) => {
  // get user name
  const { name } = await rtm.client.getUserAttributesByKeys(MemberId, ['name']);

  const membersWrapper = document.getElementById('member__list');
  const memberItem = `
    <div class="member__wrapper" id="member__${MemberId}__wrapper">
      <span class="green__icon"></span>
      <p class="member_name">${name}</p>
    </div>
  `;
  membersWrapper.insertAdjacentHTML('beforeend', memberItem);
};

// function that update the total participants to the dom
const updateMemberTotal = async (members) => {
  const total = document.getElementById('members__count');
  total.innerText = members.length;
};

// member left handler
const handleMemberLeft = async (MemberId) => {
  removeMemberFromDom(MemberId);

  const members = await rtm.channel.getMembers();
  updateMemberTotal(members);
};

// remove user dom when they left function
const removeMemberFromDom = async (MemberId) => {
  const memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  const name =
    memberWrapper.getElementsByClassName('member_name')[0].textContent;

  memberWrapper.remove();

  addBotMessageToDom(`${name} has left the room!`);
};

// get members function
const getMembers = async () => {
  const members = await rtm.channel.getMembers();

  updateMemberTotal(members);

  for (let i = 0; members.length > i; i++) {
    addMemberToDom(members[i]);
  }
};

// message functionalities
// rtm channel message handler
const handleChannelMessage = async (messageData, MemberId) => {
  // Initialize data variable to parse the data
  const data = JSON.parse(messageData.text);

  // Add dom message element
  if (data.type === 'chat') {
    addMessageToDom(data.displayName, data.message);
  }

  // If user left delete them in the stream
  if (data.type === 'user_left') {
    document.getElementById(`user-container-${data.uid}`).remove();

    if (userIdInDisplayFrame.val === `user-container-${data.uid}`) {
      hideDisplayFrame();
      // displayFrame.style.display = null;

      // resetTheFrames();
    }
  }

  // if other user share a screen expand them in display frame
  if (data.type === 'user_screen_share') {
    const user = `user-container-${data.uid}`;
    const dom = document.getElementById(user);

    const child = displayFrame.children[0];
    if (child) {
      document.getElementById('streams__container').appendChild(child);
    }

    if (dom !== null) {
      displayFrame.style.display = 'block';
      displayFrame.appendChild(dom);
      userIdInDisplayFrame.val = user;
    } else {
      displayFrame.style.display = 'block';
      displayFrame.insertAdjacentHTML('beforeend', player(data.uid));
      document
        .getElementById(`user-container-${data.uid}`)
        .addEventListener('click', expandVideoFrame)
        .scrollIntoView();
    }
  }

  // if other screen share is close hide and reset frames
  if (data.type === 'user_screen_share_close') {
    hideDisplayFrame();
  }

  // if student
  if (userData.type === 'host' || userData.type === 'student') {
    // if a teacher or host decided to take attendance
    if (data.type === 'take_attendance') {
      faceRecognitionHandler();
      console.log(`this run`);
    }
    if (data.type === 'take_attendance_off') {
      console.log(`this also run`);
      // stopTimer();
    }
  }
};

// function to send message
const sendMessage = async (e) => {
  e.preventDefault();

  const message = e.target.message.value;
  if (message === '') return;

  rtm.channel.sendMessage({
    text: JSON.stringify({
      type: 'chat',
      message: message,
      displayName: userData.fullName,
    }),
  });

  addMessageToDom(userData.fullName, message);

  e.target.reset();
};

// users chat room
const addMessageToDom = (name, message) => {
  const messagesWrapper = document.getElementById('messages');

  const newMessage = `
    <div class='message__wrapper'>
      <div class='message__body'>
        <strong class="message__author">${name}</strong>
        <p class='message__text'>${message}</p>
      </div>
    </div>
  `;

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

  const lastMessage = document.querySelector(
    '#messages .message__wrapper:last-child'
  );

  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
};

// bot message
const addBotMessageToDom = (botMessage) => {
  const messagesWrapper = document.getElementById('messages');

  const newMessage = `
    <div class='message__wrapper'>
      <div class='message__body__bot'>
        <strong class="message__author__bot">👽 Present Meet Bot</strong>
        <p class='message__text__bot'>${botMessage}</p>
      </div>
    </div>
  `;

  messagesWrapper.insertAdjacentHTML('beforeend', newMessage);

  const lastMessage = document.querySelector(
    '#messages .message__wrapper:last-child'
  );

  if (lastMessage) {
    lastMessage.scrollIntoView();
  }
};

// rtm leave channel async function
const leaveChannel = async () => {
  await rtm.channel.leave();
  await rtm.client.logout();
};

export {
  sendMessage,
  getMembers,
  handleChannelMessage,
  handleMemberJoin,
  handleMemberLeft,
  addBotMessageToDom,
  addMemberToDom,
  addMessageToDom,
  leaveChannel,
};
