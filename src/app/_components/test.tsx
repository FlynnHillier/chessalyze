"use client";

import { trpc } from "~/app/_trpc/client";

/**
 * Initiate socket emit events on the server.
 */
export default function Test() {
  const testMutation = trpc.dev.testUserSockets.useMutation();
  const moveMutation = trpc.dev.dummyMoveEvent.useMutation();

  const testDev = () => {
    testMutation.mutate();
  };

  const testMove = () => {
    moveMutation.mutate();
  };

  return (
    <>
      <button onClick={testDev} disabled={testMutation.isLoading}>
        test dev
      </button>
      <br />
      <button onClick={testMove} disabled={moveMutation.isLoading}>
        test move
      </button>
    </>
  );
}
