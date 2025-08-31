import { useFieldContext } from "@/client/components/form";
import { Label } from "@/client/components/ui/label";
import { Textarea } from "@/client/components/ui/textarea";

type Props = {
  label: string;
  placeholder?: string;
};

export const TextareaField = ({ label, placeholder }: Props) => {
  const field = useFieldContext<string>();

  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        id={field.name}
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(e.target.value);
        }}
        onBlur={field.handleBlur}
        className="min-h-[120px] resize-none"
        maxLength={500}
        placeholder={placeholder}
      />
    </div>
  );
};
