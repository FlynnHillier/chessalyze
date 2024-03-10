import { getProviders } from "next-auth/react";
import SignInBtn from "~/app/_components/auth/signin.btn";

export default async function SignIn() {
  const providers = await getProviders()

  return (
    <>
      {Object.values(providers ?? {}).map((provider) => {
        return (
          <div key={provider.name}>
            <SignInBtn provider={provider} />
          </div>
        )
      })}
    </>
  )

}

