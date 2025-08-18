import ky, { type Options } from "ky";
import * as v from "valibot";

export const safeFetch = async <S extends v.BaseSchema<any, any, any>>(
  s: S,
  url: string,
  options?: Options
): Promise<v.InferOutput<S>> => {
  options = {
    method: "get",
    ...(options ?? {}),
  };

  const data = await ky(url, options).json();

  return v.parse(s, data);
};
