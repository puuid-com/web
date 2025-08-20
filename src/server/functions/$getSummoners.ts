import { createServerFn } from "@tanstack/react-start";

export const $getSummoners = createServerFn({ method: "GET" }).handler(
  async () => {
    const { IDService } = await import("@/server/services/ID");
    const data = await IDService.getIds();

    return data;
  }
);
