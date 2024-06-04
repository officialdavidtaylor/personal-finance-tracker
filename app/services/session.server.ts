import { createCookieSessionStorage } from '@remix-run/node';

// verify that the JWT_SIGNING_SECRET has been defined
if (
  !process.env.JWT_SIGNING_SECRET ||
  process.env.JWT_SIGNING_SECRET.length === 0
)
  throw new Error('JWT_SIGNING_SECRET missing from environment variables');

// export the whole sessionStorage object
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.JWT_SIGNING_SECRET], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = sessionStorage;
