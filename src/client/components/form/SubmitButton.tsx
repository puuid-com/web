import { useFormContext } from "@/client/components/form";
import { Button } from "@/client/components/ui/button";

type Props = {
  label: string;
};

export const SubmitButton = ({ label }: Props) => {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
};
