import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import axios from "axios"
import {SDK, Configuration} from "@corbado/node-sdk";
import React, { useCallback, useEffect, useState } from "react";


const PASSKEY_CREATION_SUCCESSFUL = "PASSKEY_CREATION_SUCCESSFUL"
const PASSKEY_CREATION_FAILED = "PASSKEY_CREATION_FAILED"
const DEVICE_NOT_PASSKEY_READY = "DEVICE_NOT_PASSKEY_READY"

const config = new Configuration("pro-4980969548765423728", "corbado1_HPA5LR4Yg6dSfFpDCcyMSeyL9QUZC2");
const corbado = new SDK(config);

interface AssociationToken {
  associationToken: string
}

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export  default async function Header() {
  const { data: session, status } = useSession()



  console.log("Corbado projID: " + process.env.CORBADO_PROJECT_ID);


  // Instead of clicking on a button, you can also start the backend API call, when the user opens a new page
  // It's only important to note, that you can only use the <corbado-passkey-associate/> web component if
  // an association token has been created before.
  const handleButtonClick = async () => {
    try {
      console.log("Nextauth url: " + process.env.NEXTAUTH_URL);
        // loginIdentifier needs to be obtained via a backend call or your current state / session management
        // it should be a dynamic value depending on the current logged-in user
        const response = await axios.post<AssociationToken>(process.env.NEXTAUTH_URL + "/api/createAssociationToken", {
            loginIdentifier: "nic+20@corbado.com",
            loginIdentifierType: "email"
        })
        setAssociationToken(response.data)
    } catch (err) {
        console.log(err)
    }
  }
 
  
  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <p
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {session?.user && (
            <>
              {session.user.image && (
                <span
                  style={{ backgroundImage: `url('${session.user.image}')` }}
                  className={styles.avatar}
                />
              )}
              <span className={styles.signedInText}>
                <small>Signed in as</small>
                <br />
                <strong>{session.user.email ?? session.user.name}</strong>
              </span>
              
              <a
                href={`/api/auth/signout`}
                className={styles.button}
                onClick={(e) => {
                  e.preventDefault()
                  signOut()
                }}
              >
                Sign out
              </a>
            </>
          )}
        </p>
      </div>
      <nav>
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/client">Client</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/server">Server</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/protected">Protected</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/api-example">API</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin">Admin</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/me">Me</Link>
          </li>
        </ul>
      </nav>

      {session?.user && (
        <>

            <button onClick={handleButtonClick}>Add passkey to my account</button>
            <p> Passkey associate</p>
          
          </>
            )}
    </header>
  )
}
