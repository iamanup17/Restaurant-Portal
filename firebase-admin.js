// const admin = require("firebase-admin");
// const serviceAccount = require("./config/indian-delights-bb2ed-firebase-adminsdk-fbsvc-ed049a1ddc.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;


const admin = require('firebase-admin');
const path = require('./serviceKey.json');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = admin.messaging();

module.exports = { admin, messaging };