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

        console.log("CredentialsProvider called");

        const config = new Configuration(projectID, apiSecret);
        const corbado = new SDK(config);

        console.log("Before getting current user")
        if (corbado == null) {
          console.log("Corbado is null");
        }
        if (corbado.session == null) {
          console.log("Corbado.session is null");
        }
        if (corbado.session.getCurrentUser == null) {
          console.log("Corbado.session.getCurrentUser is null");
        }

        var cbo_short_session = req.headers.cookie.split("; ").find(row => row.startsWith("cbo_short_session"));
        console.log("CBO Short Session: ", cbo_short_session);
        var token = cbo_short_session.split("=")[1];
        console.log("Token: ", token);



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
              return { email: payload.email };
            }else{
              console.log("issuer not valid")
            }
        }
        catch (e) {
            console.log("Error: ", e)
        }



/*
        var url = "https://" + projectID + ".frontendapi.corbado.io/v1/me";

        console.log("URL: ", url);

        var resp = https.get(url, {
          headers: {
            "Authorization": "Bearer " + token,
            "cookie": "cbo_short_session=" + token,+
          }
        }, function(response) {
          console.log("Response from http.get")
      //    console.log(response);
      response.on('error', function (err) {

        console.log("Error: ", err);
      }

      );
      response.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
      console.log(response.body)
        },
      );

        console.log("Response: ", resp);
        console.log("Response body: ", resp.body)
        
*/

/*
        req.cookies = {"cbo_short_session": token};
        console.log("final req object: ", req)
      //  const user = await corbado.session.getCurrentUser({cookies: {cbo_short_session: token}, "headers": {"authorization": "Test"}});

        const user = await corbado.session.getCurrentUser(req);
        console.log("User: ", user);
        if (user.authenticated) {
          console.log("User is authenticated");
          console.log("user: ", JSON.stringify(user));
            // You can only access data if
            // user is logged in!
            
            // Get full user object (makes call to Backend API)
            const fullUser = await corbado.users.get(user.id);
            console.log("Full user: ", fullUser);
            return { email: user.id };
        }else{
          console.log("User is not authenticated");
        }
*/
      
        
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
