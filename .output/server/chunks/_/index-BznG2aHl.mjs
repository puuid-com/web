import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
import { c as cn } from './utils-H80jjgLf.mjs';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Link } from '@tanstack/react-router';
import 'clsx';
import 'tailwind-merge';

function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function RouteComponent() {
  const [player, setPlayer] = useState("");
  const handleInutChange = (event) => {
    setPlayer(event.currentTarget.value);
  };
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx(Label, { children: "Riot ID" }),
    /* @__PURE__ */ jsx(Input, { type: "text", value: player, onChange: handleInutChange, placeholder: "{GameName}#{TagLine}" }),
    /* @__PURE__ */ jsx(Link, { to: "/lol/summoner/$riotID", params: {
      riotID: player.replace("#", "-")
    }, children: "See" })
  ] }) });
}

export { RouteComponent as component };
//# sourceMappingURL=index-BznG2aHl.mjs.map
