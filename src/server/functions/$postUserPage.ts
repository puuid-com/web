import { UserPageUpdateFormSchema } from "@/client/components/user/UserUpdateForm";
import { $authMiddleware } from "@/server/middleware/$authMiddleware";
import { createServerFn } from "@tanstack/react-start";

export const $postUserPage = createServerFn({ method: "POST" })
  .middleware([$authMiddleware])
  .validator(UserPageUpdateFormSchema)
  .handler(async (ctx) => {
    const { user } = ctx.context;
    const updateData = ctx.data;

    const { UserPageService } = await import("@/server/services/UserPageService");
    await UserPageService.updateUserPage(user.id, {
      ...updateData,
      description: updateData.description.trim() === "" ? null : updateData.description,
      xUsername: updateData.xUsername.trim() === "" ? null : updateData.xUsername,
      twitchUsername: updateData.twitchUsername.trim() === "" ? null : updateData.twitchUsername,
    });
  });

export type $postUserPageType = Awaited<ReturnType<typeof $postUserPage>>;
