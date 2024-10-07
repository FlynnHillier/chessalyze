import { ReactNode } from "react";

export function SocialTemplateLayout({
  children,
  header,
}: {
  children?: ReactNode;
  header?: ReactNode;
}) {
  return (
    <div className="flex flex-grow flex-col gap-1 ">
      {header && (
        <div className="flex flex-row flex-nowrap items-center gap-2 bg-stone-800 px-3 pb-3 pt-3 text-xl font-bold tracking-wide shadow-2xl md:text-3xl">
          {header}
        </div>
      )}
      {children}
    </div>
  );
}
