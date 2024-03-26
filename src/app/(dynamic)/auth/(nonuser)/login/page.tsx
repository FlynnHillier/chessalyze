import Link from "next/link";

export default async function SignIn() {
  return (
    <>
      <Link href={"/api/auth/login/google"}> login in with google </Link>
    </>
  );
}
