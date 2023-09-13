import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProviders, signIn } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]";
import { startAuthentication } from '@simplewebauthn/browser';

async function handleWebauthn() {
    const url = new URL(
        'https://pro-1191574164386091635.frontendapi.corbado.io/api/auth/webauthn/authenticate',
        window.location.origin,
    );
    url.search = new URLSearchParams({ email }).toString();
    const optionsResponse = await fetch(url.toString());

    if (optionsResponse.status !== 200) {
        throw new Error('Could not get authentication options from server');
    }
    const opt: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

    if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
        throw new Error('There is no registered credential.')
    }

    const credential = await startAuthentication(opt);

    await signIn('credentials', {
        id: credential.id,
        rawId: credential.rawId,
        type: credential.type,
        clientDataJSON: credential.response.clientDataJSON,
        authenticatorData: credential.response.authenticatorData,
        signature: credential.response.signature,
        userHandle: credential.response.userHandle,
    })
}

export default function SignIn({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {


  var providersNew = Object.values(providers);
  providersNew = providersNew.filter(function (el) {
    return el.name != "webauthn";
    });

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
        <input type="text" id="email" name="email" placeholder="email"/>
        <button onClick={() => handleWebauthn()}>
            Sign in with webauthn
        </button>
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