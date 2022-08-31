const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
const videoLink = document.querySelector('.link');
const userData = [];

const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};

videoLink.addEventListener('click', copyClipboard);

window.addEventListener('load', () => {
  videoLink.textContent = meetingId;

  const infoUrl = `http://localhost:3000/profile`;
  async function getInfo() {
    // e.preventDefault();
    const res = await fetch(infoUrl, { method: 'GET' });
    const data = await res.json();
    userData.push(data.profile);
  }

  getInfo();
});
