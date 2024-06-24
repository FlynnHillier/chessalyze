import React, { useState } from "react";

/**
 * Simplified component for receiving user input and submitting
 *
 * DO NOT USE FOR PRODUCTION STUFF - just a finicky component good for quick testing
 */
export default function TRPCForm<
  T extends Record<
    string,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">
  >,
  K extends Extract<keyof T, string>,
>({
  inputs,
  onSubmitFormData,
  button,
}: {
  button?: {
    props?: Omit<
      React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >,
      "onClick"
    >;
    text?: string;
  };
  inputs?: T;
  onSubmitFormData: ({ inputs }: { inputs: Record<K, string> }) => any;
}) {
  let [submitPending, setSubmitPending] = useState<boolean>(false);

  /**
   *
   * @param fd formData
   * @returns mapped input names to their inputted values { inputName: inputValue}
   */
  function getInputValues(fd: FormData): Record<K, string> {
    if (!inputs) return {} as Record<K, string>;

    return Object.keys(inputs).reduce(
      (acc, current) => ({ ...acc, [current]: fd.get(current) }),
      {},
    ) as Record<K, string>;
  }

  return (
    <form
      action={async (fd) => {
        setSubmitPending(true);
        await onSubmitFormData({ inputs: getInputValues(fd) });
        setSubmitPending(false);
      }}
    >
      {inputs &&
        Object.keys(inputs).map((i) => (
          <input key={i} name={i} {...inputs[i]}></input>
        ))}
      <button
        {...button?.props}
        disabled={button?.props?.disabled || submitPending}
      >
        {button?.text ?? "submit"}
      </button>
    </form>
  );
}
