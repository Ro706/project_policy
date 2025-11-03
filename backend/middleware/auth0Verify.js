// middleware/auth0Verify.js
const { auth } = require('express-oauth2-jwt-bearer');

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE, // from .env
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

module.exports = checkJwt;
