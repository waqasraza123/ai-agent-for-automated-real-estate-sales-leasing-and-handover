import {
  canOperatorRolePerform,
  getRequiredOperatorRoles,
  insufficientRoleErrorSchema,
  operatorRoleSchema,
  type InsufficientRoleError,
  type OperatorPermission,
  type OperatorRole
} from "@real-estate-ai/contracts";
import type { SupportedLocale } from "@real-estate-ai/domain";

export const operatorRoleCookieName = "operator_role";
export const defaultOperatorRole: OperatorRole = "handover_manager";
export const operatorRoleOptions: OperatorRole[] = ["sales_manager", "handover_coordinator", "handover_manager", "admin"];

export function getOperatorRoleFromCookie(value: string | undefined): OperatorRole {
  const result = operatorRoleSchema.safeParse(value);

  return result.success ? result.data : defaultOperatorRole;
}

export function canCurrentOperatorPerform(permission: OperatorPermission, operatorRole: OperatorRole) {
  return canOperatorRolePerform(permission, operatorRole);
}

export function getOperatorPermissionGuardNote(locale: SupportedLocale, permission: OperatorPermission) {
  const roleLabels = getRequiredOperatorRoles(permission).map((role) => getOperatorRoleLabel(locale, role));
  const joinedRoles =
    roleLabels.length === 2 ? roleLabels.join(locale === "ar" ? " أو " : " or ") : joinRoleLabels(locale, roleLabels);

  return locale === "ar"
    ? `يتطلب هذا الإجراء دور ${joinedRoles} في وضع التحكم المحلي.`
    : `This action requires the ${joinedRoles} role in local control mode.`;
}

export function getInsufficientRoleError(body: unknown): InsufficientRoleError | null {
  const result = insufficientRoleErrorSchema.safeParse(body);

  return result.success ? result.data : null;
}

export function getOperatorRoleLabel(locale: SupportedLocale, role: OperatorRole) {
  const labels = {
    ar: {
      admin: "المشرف",
      handover_coordinator: "منسق التسليم",
      handover_manager: "مدير التسليم",
      sales_manager: "مدير المبيعات"
    },
    en: {
      admin: "admin",
      handover_coordinator: "handover coordinator",
      handover_manager: "handover manager",
      sales_manager: "sales manager"
    }
  } as const;

  return labels[locale][role];
}

function joinRoleLabels(locale: SupportedLocale, roleLabels: string[]) {
  const leadingLabels = roleLabels.slice(0, -1).join(", ");
  const trailingLabel = roleLabels.at(-1);

  if (!trailingLabel) {
    return "";
  }

  return locale === "ar" ? `${leadingLabels} أو ${trailingLabel}` : `${leadingLabels}, or ${trailingLabel}`;
}
