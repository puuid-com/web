import { fieldContext, formContext } from "@/client/components/form";
import { SubmitButton } from "@/client/components/form/SubmitButton";
import { TextField } from "@/client/components/form/TextField";
import { createFormHook } from "@tanstack/react-form";

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm };
