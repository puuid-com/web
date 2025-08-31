import { fieldContext, formContext } from "@/client/components/form";
import { SubmitButton } from "@/client/components/form/SubmitButton";
import { TextareaField } from "@/client/components/form/TextareaField";
import { TextField } from "@/client/components/form/TextField";
import { createFormHook } from "@tanstack/react-form";

const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextareaField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm };
