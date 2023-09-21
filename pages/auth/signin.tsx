import type { GetServerSidePropsContext, InferGetServerSidePropsType, NextApiRequest, NextApiResponse } from "next";
import { getProviders, signIn } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]";
import { useCallback, useEffect, useState } from "react";

const PASSKEY_LOGIN_SUCCESSFUL = "PASSKEY_LOGIN_SUCCESSFUL"
const PASSKEY_LOGIN_FAILED = "PASSKEY_LOGIN_FAILED"
const PASSKEY_NOT_EXISTS = "PASSKEY_NOT_EXISTS"

export default function SignIn( 
   { providers }: InferGetServerSidePropsType<typeof getServerSideProps>,  req: NextApiRequest,
   res: NextApiResponse) {
  const [ref, setRef] = useState<any | null>(null)
  const [session, setSession] = useState<any>(null);

  // The following event handlers can be used to react to different events from the web component
  const onPasskeyLoginSuccessful = useCallback(async (_event: CustomEvent) => {
      console.log("Passkey login successful")
      console.log(JSON.stringify(_event))
      console.log(JSON.stringify(_event.detail))
      console.log("REFRESHING SESSION")
      var headers = req
      console.log("Cookies: ", headers)
      signIn("credentials", { user: "user"})

    
  }, [])

  const onPasskeyLoginFailed = useCallback((_event: CustomEvent) => {
      console.log("Passkey login failed")
      console.log(_event)
  }, [])

  const onPasskeyNotExists = useCallback((_event: CustomEvent) => {
      console.log("Passkey not exists")
      console.log(_event)
  }, [])


  var providersNew = Object.values(providers);
  providersNew = providersNew.filter(function (el) {
    return el.name != "webauthn";
    });


    useEffect(() => {
      // This will run only on client-side
      import('@corbado/webcomponent')
          .then(module => {
              const Corbado = module.default || module;

              console.log("Initializing Corbado session")
              setSession(new Corbado.Session("pro-2808756695548043260"));
          })
          .catch(err => {
              console.log(err);
          });
  }, [])

  useEffect(() => {
      // Refresh the session whenever it changes
      if (session) {
          session.refresh(() => {
          });
      }
  }, [session]);


  useEffect(() => {

      // Create and remove the event listeners
      if (ref) {
          ref.addEventListener(PASSKEY_LOGIN_SUCCESSFUL, onPasskeyLoginSuccessful)
          ref.addEventListener(PASSKEY_LOGIN_FAILED, onPasskeyLoginFailed)
          ref.addEventListener(PASSKEY_NOT_EXISTS, onPasskeyNotExists)
      }

      // Cleanup function
      return () => {
          if (ref) {
              ref.removeEventListener(PASSKEY_LOGIN_SUCCESSFUL, onPasskeyLoginSuccessful)
              ref.removeEventListener(PASSKEY_LOGIN_FAILED, onPasskeyLoginFailed)
              ref.removeEventListener(PASSKEY_NOT_EXISTS, onPasskeyNotExists)
          }

      };
  }, [ref, onPasskeyLoginSuccessful, onPasskeyLoginFailed, onPasskeyNotExists,])

  return (
    <>
    <p>Please sign in</p>
      {providersNew.map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
      <p>---- OR ----</p>
      <div key="webauthn">
                <corbado-passkey-associate-login
                    project-id="pro-2808756695548043260"
                    ref={setRef}
                />
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();
  
  return {
    props: { providers: providers ?? [] },
  }
}