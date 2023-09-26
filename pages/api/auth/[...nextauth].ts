import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import GithubProvider from "next-auth/providers/github"
import TwitterProvider from "next-auth/providers/twitter"
import Auth0Provider from "next-auth/providers/auth0"
import CredentialsProvider from "next-auth/providers/credentials"

import * as jose from "jose";
import Corbado from '@corbado/webcomponent';
import {SDK, Configuration} from '@corbado/node-sdk';
import http from 'http';
import https from 'https';
require('https');

const projectID = process.env.CORBADO_PROJECT_ID;
const apiSecret = process.env.API_SECRET;

console.log("Project ID: ", projectID);
console.log("API Secret: ", apiSecret);


// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    /* EmailProvider({
         server: process.env.EMAIL_SERVER,
         from: process.env.EMAIL_FROM,
       }),
    // Temporarily removing the Apple provider from the demo site as the
    // callback URL for it needs updating due to Vercel changing domains

    Providers.Apple({
      clientId: process.env.APPLE_ID,
      clientSecret: {
        appleId: process.env.APPLE_ID,
        teamId: process.env.APPLE_TEAM_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        keyId: process.env.APPLE_KEY_ID,
      },
    }),
    */
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID,
      clientSecret: process.env.TWITTER_SECRET,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
    CredentialsProvider({
      name: 'webauthn',
      credentials: {},
      async authorize(cred, req) {
        var cbo_short_session = req.headers.cookie.split("; ").find(row => row.startsWith("cbo_short_session"));
        console.log("CBO Short Session: ", cbo_short_session);
        var token = cbo_short_session.split("=")[1];
        var issuer = "https://" + projectID + ".frontendapi.corbado.io";
        var jwksUrl = issuer + "/.well-known/jwks"; 

        const JWKS = jose.createRemoteJWKSet(new URL(jwksUrl), {
          cacheMaxAge: 10 * 60 * 1000
        })
        const options = {
            issuer: issuer,
        }

        try {
            const {payload} = await jose.jwtVerify(token, JWKS, options)
            if (payload.iss === issuer) {
              console.log("issuerValid!")
              console.log(payload.sub);
              console.log(payload.name);
              console.log(payload.email);
              console.log(payload.phoneNumber);
              console.log("Returning...")

              //Load data from database
              return { email: payload.email, name: payload.name, image: null};
            }else{
              console.log("issuer not valid")
            }
        }
        catch (e) {
            console.log("Error: ", e)
        }
      }
  })
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
}

export default NextAuth(authOptions)
