"use client";

import { ComponentProps, useEffect, useState } from "react";
import Modal from "react-modal";
import { cn } from "~/lib/util/cn";
import { IoMdClose } from "react-icons/io";

export function GenericModal({
  className,
  onRequestClose,
  children,
  closeIconSize,
  showCloseIcon,
  header,
  portalClassName,
  ...otherProps
}: {
  closeIconSize?: number;
  showCloseIcon?: boolean;
  header?: string;
} & ComponentProps<typeof Modal>) {
  return (
    <Modal
      overlayClassName={
        "fixed top-0 left-0 right-0 bottom-0 backdrop-blur-sm flex justify-center items-center "
      }
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      className={cn(
        "h-fit w-108 rounded-lg bg-stone-950",
        portalClassName,
        "relative overflow-hidden",
      )}
      onRequestClose={onRequestClose}
      shouldFocusAfterRender={false}
      {...otherProps}
    >
      <>
        {showCloseIcon !== false && (
          <button className="absolute right-1 top-1" onClick={onRequestClose}>
            <IoMdClose size={closeIconSize ?? 25} />
          </button>
        )}
        {header && (
          <div className="mb-2 h-12 w-full text-balance py-2 text-center text-xl font-bold tracking-wide shadow-lg shadow-stone-900">
            {header}
          </div>
        )}
        <div className={cn("inline-block h-112 w-full p-3", className)}>
          {children}
        </div>
      </>
    </Modal>
  );
}
