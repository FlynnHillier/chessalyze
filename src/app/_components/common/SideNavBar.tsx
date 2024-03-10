"use client";

import Link from "next/link";
import { FaChessKing, FaHome } from "react-icons/fa";

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
    url: "/",
    text: "home",
    icon: <FaHome />,
  },
];

export function SideNavBar() {
  return (
    <div className="inline-block h-full truncate hover:text-wrap md:w-fit dark:bg-stone-800 dark:text-orange-100">
      <div className="p-1 px-2 text-center font-bold">Chessalyze</div>
      <div className="flex w-full flex-col">
        {navOptions.map((option) => (
          <Link
            href={option.url}
            className="flex flex-row items-center pl-1.5 hover:cursor-pointer dark:hover:bg-stone-900"
            key={option.url}
          >
            {option.icon}
            <div className="p-1 font-semibold">{option.text}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
