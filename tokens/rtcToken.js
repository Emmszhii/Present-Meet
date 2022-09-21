const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// AgoraSDK TOKEN
const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
};

// GENERATE RTC TOKEN
const generateRTCToken = (req, resp) => {
  resp.header('Access-Control-Allow-Origin', '*');
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ error: 'channel is required' });
  }
  let id = req.params.id;
  if (!id || id === '') {
    return resp.status(500).json({ error: 'id is required' });
  }
  // get role
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER;
  } else {
    return resp.status(500).json({ error: 'role is incorrect' });
  }
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      id,
      role,
      privilegeExpireTime
    );
  } else if (req.params.tokentype === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channelName,
      id,
      role,
      privilegeExpireTime
    );
  } else {
    return resp.status(500).json({ error: 'token type is invalid' });
  }
  return resp.json({
    rtcToken: token,
  });
};

module.exports = { nocache, generateRTCToken };
