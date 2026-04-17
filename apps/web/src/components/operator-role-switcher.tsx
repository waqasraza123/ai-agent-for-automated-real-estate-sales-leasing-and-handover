"use client";

import { useFormStatus } from "react-dom";

import { usePathname } from "next/navigation";

import type { OperatorRole } from "@real-estate-ai/contracts";
import type { AppMessages } from "@real-estate-ai/i18n";
import { Button, Select, TextInput } from "@real-estate-ai/ui";

import { setOperatorRoleAction } from "@/app/actions";
import { operatorRoleOptions } from "@/lib/operator-role";

export function OperatorRoleSwitcher(props: {
  currentOperatorRole: OperatorRole;
  messages: AppMessages;
}) {
  const pathname = usePathname();

  return (
    <form action={setOperatorRoleAction} className="flex flex-wrap items-end gap-3" data-testid="operator-role-switcher">
      <input name="returnPath" type="hidden" value={pathname} />
      <label className="flex min-w-[12rem] flex-col gap-2 text-xs font-semibold tracking-[0.16em] text-ink-soft">
        <span>{props.messages.common.operatorRole}</span>
        <Select defaultValue={props.currentOperatorRole} name="operatorRole">
          {operatorRoleOptions.map((role) => (
            <option key={role} value={role}>
              {props.messages.roles[role]}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex min-w-[12rem] flex-col gap-2 text-xs font-semibold tracking-[0.16em] text-ink-soft">
        <span>Access key</span>
        <TextInput autoComplete="off" name="accessKey" required type="password" />
      </label>
      <RoleSubmitButton label={props.messages.common.applyRole} />
    </form>
  );
}

function RoleSubmitButton(props: {
  label: string;
}) {
  const status = useFormStatus();

  return (
    <Button disabled={status.pending} tone="secondary" type="submit">
      {props.label}
    </Button>
  );
}
