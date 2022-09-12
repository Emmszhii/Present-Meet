const { RtmTokenBuilder, RtmRole } = require('agora-access-token');

// GENERATE RTM TOKEN
const generateRTMToken = (req, resp) => {
  // set response header
  resp.header('Access-Control-Allow-Origin', '*');

  // get uid
  const uid = req.params.uid;
  if (!uid || uid === '') {
    return resp.status(500).json({ error: 'uid is required' });
  }
  // get role
  const role = RtmRole.Rtm_User;
  // get the expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const APP_ID = process.env.AGORA_APP_ID;
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
  const token = RtmTokenBuilder.buildToken(
    APP_ID,
    APP_CERTIFICATE,
    uid,
    role,
    privilegeExpireTime
  );
  // return the token
  return resp.json({ rtmToken: token });
};

module.exports = { generateRTMToken };
