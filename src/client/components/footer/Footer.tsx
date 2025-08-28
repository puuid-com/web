import { Link } from "@tanstack/react-router";

type Props = {};

export const Footer = ({}: Props) => {
  return (
    <div className={"h-[60px] flex w-full border-t justify-center items-center mt-auto"}>
      <div className={"container flex justify-between items-center"}>
        <ul className={"flex gap-2.5 text-sm"}>
          <Link to={"/privacy"}>
            <li>Privacy</li>
          </Link>
          <Link to={"/terms"}>
            <li>Terms</li>
          </Link>
        </ul>
        <div className={"text-tiny text-muted-foreground text-balance text-end"}>
          <span className={"font-bold italic"}>puuid.com</span> is not endorsed by Riot Games and
          does not reflect the views or opinions of Riot Games or anyone officially involved in
          producing or managing Riot Games properties.
          <br /> Riot Games and all associated properties are trademarks or registered trademarks of
          Riot Games, Inc.
        </div>
      </div>
    </div>
  );
};
