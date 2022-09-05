// Initialize the variable
const messageForm = document.getElementById('message__form');

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
  console.log('A new message was received');
  const data = JSON.parse(messageData.text);

  if (data.type === 'chat') {
    addMessageToDom(data.displayName, data.message);
  }

  if (data.type === 'user_left') {
    document.getElementById(`user-container-${data.uid}`).remove();

    if (userIdInDisplayFrame === `user-container-${userData.rtcId}`) {
      displayFrame.style.display = null;

      // frameVideo();
      for (let i = 0; videoFrames.length > i; i++) {
        if (videoFrames[i].id != userIdInDisplayFrame) {
          videoFrames[i].style.width = '300px';
          videoFrames[i].style.height = '200px';
        }
      }
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

// users
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

// bot
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

// when a user forced close they will be deleted to the dom
window.addEventListener('beforeunload', leaveChannel);

messageForm.addEventListener('submit', sendMessage);
