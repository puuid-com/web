import { useFieldContext } from "@/client/components/form";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";

type Props = {
  label: string;
};

export const TextField = ({ label }: Props) => {
  const field = useFieldContext<string>();

  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        value={field.state.value}
        onChange={(e) => {
          field.handleChange(e.target.value);
        }}
      />
    </div>
  );
};
