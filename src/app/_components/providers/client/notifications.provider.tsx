"use client";

import { useWebSocket } from "next-ws/client";
import { ReactNode, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";

import "react-toastify/dist/ReactToastify.css";
import "~/styles/toastify.override.css";

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const ws = useWebSocket();

  useEffect(() => {
    if (!ws) return;

    function onWsMessageEvent(e: MessageEvent) {
      wsServerToClientMessage.receiver({
        "LOBBY:INVITE_RECEIVED": ({ lobbyPreview, user }) => {
          console.log(lobbyPreview, user);
          toast("recieved an invite!");
        },
      })(e.data);
    }

    ws.addEventListener("message", onWsMessageEvent);

    return () => {
      ws.removeEventListener("message", onWsMessageEvent);
    };
  }, [ws]);

  return (
    <>
      <ToastContainer theme="dark" position="bottom-right" stacked={true} />{" "}
      {children}
    </>
  );
}
