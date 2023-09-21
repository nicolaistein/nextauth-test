import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import styles from "./header.module.css"
import axios from "axios"
import ('@corbado/webcomponent')
import React, { useCallback, useEffect, useState } from "react";


const PASSKEY_CREATION_SUCCESSFUL = "PASSKEY_CREATION_SUCCESSFUL"
const PASSKEY_CREATION_FAILED = "PASSKEY_CREATION_FAILED"
const DEVICE_NOT_PASSKEY_READY = "DEVICE_NOT_PASSKEY_READY"

interface AssociationToken {
  associationToken: string
}

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export  default function Header() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [associationToken, setAssociationToken] = useState<AssociationToken | null>(null)
  const [ref, setRef] = useState<any | null>(null)

    // The following event handlers can be used to react to different events from the web component
    const onPasskeyCreationSuccessful = useCallback((_event: CustomEvent) => {
      console.log("Passkey creation successful");
      console.log(_event)
  }, [])

  const onPasskeyCreationFailed = useCallback((_event: CustomEvent) => {
      console.log("Passkey creation failed");
      console.log(_event)
  }, [])

  const onDeviceNotPasskeyReady = useCallback((_event: CustomEvent) => {
      console.log("Device not passkey ready");
      console.log(_event)
  }, [])


  // Create and remove the event listeners
  useEffect(() => {
      if (ref) {
          ref.addEventListener(PASSKEY_CREATION_SUCCESSFUL, onPasskeyCreationSuccessful)
          ref.addEventListener(PASSKEY_CREATION_FAILED, onPasskeyCreationFailed)
          ref.addEventListener(DEVICE_NOT_PASSKEY_READY, onDeviceNotPasskeyReady)
      }

      // Cleanup function
      return () => {
          if (ref) {
              ref.removeEventListener(PASSKEY_CREATION_SUCCESSFUL, onPasskeyCreationSuccessful)
              ref.removeEventListener(PASSKEY_CREATION_FAILED, onPasskeyCreationFailed)
              ref.removeEventListener(DEVICE_NOT_PASSKEY_READY, onDeviceNotPasskeyReady)
          }
      };
  }, [ref, onPasskeyCreationSuccessful, onPasskeyCreationFailed, onDeviceNotPasskeyReady])



  // Instead of clicking on a button, you can also start the backend API call, when the user opens a new page
  // It's only important to note, that you can only use the <corbado-passkey-associate/> web component if
  // an association token has been created before.
  const handleButtonClick = async () => {
    try {
        // loginIdentifier needs to be obtained via a backend call or your current state / session management
        // it should be a dynamic value depending on the current logged-in user
        const response = await axios.post<AssociationToken>("/api/auth/associate", {
            loginIdentifier: "nic+1@corbado.com",
            loginIdentifierType: "email"
        })
        console.log("Response: ", response.data)
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

            {associationToken &&
                    <corbado-passkey-associate
                        project-id="pro-2808756695548043260"
                        association-token={associationToken}
                        ref={setRef}
                    />}
          </>
            )}
    </header>
  )
}
