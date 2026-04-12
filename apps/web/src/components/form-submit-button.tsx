"use client";

import { useFormStatus } from "react-dom";

export function FormSubmitButton(props: {
  disabled?: boolean;
  disabledLabel?: string;
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || props.disabled;

  return (
    <button className="primary-button" disabled={isDisabled} type="submit">
      {pending ? props.pendingLabel : props.disabled ? props.disabledLabel ?? props.idleLabel : props.idleLabel}
    </button>
  );
}
