"use client";

import Link from "next/link";
import { FaChessKing, FaHome, FaUser, FaUsers } from "react-icons/fa";
import { BiSolidBinoculars } from "react-icons/bi";

import { RiLogoutBoxRLine } from "react-icons/ri";
import { useSession } from "../providers/client/session.provider";

type NavOption = {
  url: string;
  text: string;
  icon?: React.ReactNode;
};

const navOptions: NavOption[] = [
  {
    url: "/play",
    text: "play",
    icon: <FaChessKing />,
  },
  {
    url: "/play/view",
    text: "view",
    icon: <BiSolidBinoculars />,
  },
  {
    url: "/social",
    text: "social",
    icon: <FaUsers />,
  },
  {
    url: "/",
    text: "home",
    icon: <FaHome />,
  },
];

async function logout() {
  //TODO: could this be done better so we dont have to call refresh within js. E.g request response force refresh?
  await fetch("/api/auth/logout");
  location.replace(location.origin);
}

export function SideNavBar() {
  const { user } = useSession();

  return (
    <div className="inline-block h-screen w-fit bg-stone-800 text-orange-100">
      <div className="flex h-full select-none flex-col justify-between">
        <div className="p-1 px-2 text-center text-3xl font-bold">
          Chessalyze
        </div>
        <div className="flex w-full flex-grow flex-col">
          {navOptions.map((option) => (
            <Link
              href={option.url}
              className="flex flex-row items-center pl-1.5 text-2xl hover:cursor-pointer hover:bg-stone-900"
              key={option.url}
            >
              {option.icon}
              <div className="p-1 font-semibold">{option.text}</div>
            </Link>
          ))}
        </div>
        <div className="bg-red flex h-40 w-full flex-col justify-end gap-2">
          {user && (
            <div
              className="flex flex-row items-center pl-1.5 text-lg hover:cursor-pointer hover:bg-stone-900"
              onClick={logout}
            >
              <RiLogoutBoxRLine />
              <div className="p-1 font-semibold">logout</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
