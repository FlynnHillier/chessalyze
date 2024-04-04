import { ReactNode } from "react";

/**
 * To be used to implement a 'sub header' into a panel page
 */
export default function PanelWithSubHeader({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="h-fit w-full bg-stone-800 pb-3">
        <span className="text-nowrap text-lg font-bold">{text}</span>
      </div>
      {children}
    </>
  );
}
