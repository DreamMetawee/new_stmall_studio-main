import { PUBLIC_STATIC } from "./meta"

export const getImageUrl = (pathname: string, filename: string) =>
  `${PUBLIC_STATIC || ""}${pathname}/${filename}`
