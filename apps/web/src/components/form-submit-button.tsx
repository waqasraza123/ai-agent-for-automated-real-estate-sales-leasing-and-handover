"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton(props: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button className="primary-button" disabled={pending} type="submit">
      {pending ? props.pendingLabel : props.idleLabel}
    </button>
  );
}
