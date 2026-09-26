"use client";

import { useFormStatus } from "react-dom";

/** A submit button that asks for confirmation first. Use inside a <form action={serverAction}>. */
export function ConfirmButton({
  message,
  children,
  pendingText,
  className,
  title,
}: {
  message: string;
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      title={title}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
