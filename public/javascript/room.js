const url = window.location.search;
const urlParams = new URLSearchParams(url);
const meetingId = urlParams.get('meetingId').trim();
const videoLink = document.querySelector('.link');

console.log(window.location.href);
console.log(meetingId);
videoLink.textContent = meetingId;

const copyClipboard = () => {
  navigator.clipboard.writeText(meetingId);
};
