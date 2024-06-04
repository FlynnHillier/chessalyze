"use client";

import { useRouter } from "next/navigation";
import { GoogleIconSVG } from "./svg/GoogleIcon.svg";

type Props = {
  icon: JSX.Element;
  name: string;
  intro?: string;
  tailwind: {
    bg: string;
    text: string;
  };
  disabled?: boolean;
  onClick?: () => any;
};

function SocialButton({
  icon,
  name,
  intro,
  tailwind,
  onClick,
  disabled,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`robot font-roboto flex w-full min-w-fit flex-row flex-nowrap items-center justify-center gap-2 rounded px-1.5 py-2 text-lg font-semibold ${tailwind?.bg ?? "bg-stone-100"} ${tailwind?.text ?? "text-black"}`}
    >
      {icon} {`${intro ? intro + " " : ""}${name}`}
    </button>
  );
}

function SocialButtonFactory({
  icon,
  name,
  tailwind,
}: Pick<Props, "icon" | "name" | "tailwind">) {
  return function ({
    disabled,
    intro,
    onClick,
  }: Omit<Props, "icon" | "name" | "tailwind">) {
    return (
      <SocialButton
        icon={icon}
        name={name}
        tailwind={tailwind}
        disabled={disabled}
        onClick={onClick}
        intro={intro}
      />
    );
  };
}

export const GoogleLoginButton = SocialButtonFactory({
  icon: <GoogleIconSVG size={32} />,
  name: "google",
  tailwind: { bg: "bg-slate-50", text: "text-black" },
});

export default function LoginButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2 p-3">
      <GoogleLoginButton
        onClick={() => {
          router.push("/api/auth/login/google");
        }}
      />
    </div>
  );
}
