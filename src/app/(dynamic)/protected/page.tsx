import { getServerAuthSession } from "~/server/auth"

export default async function Home() {
  const session = await getServerAuthSession()




  return (
    <div>
      {`Welcome ${session?.user.email}!`} <br />
      You reached the restricted page.
    </div>
  )
}