export interface FormActionState {
  message: string | null;
  status: "idle" | "error" | "success";
}

export const initialFormActionState: FormActionState = {
  message: null,
  status: "idle"
};
