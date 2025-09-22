export default function logging(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  version: "frontend" | "v1" | "v2" | "v3",
  path?: string
) {
  const ENV_NAME = process.env.NODE_ENV
  const HOST = ENV_NAME === "production" ? process.env.PROD_HOST : "localhost"
  const PORT = process.env.NODE_ENV === "production" ? process.env.PORT : 3005

  const FULL_HOSTNAME =
    ENV_NAME === "production"
      ? process.env.PROD_HOST
      : `http://localhost:${PORT}`

  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, "0")
  const timeString = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
    now.getSeconds()
  )} +07`

  // Bright ANSI colors
  const colors: Record<typeof method, string> = {
    GET: "\x1b[92m", // Bright Green
    POST: "\x1b[94m", // Bright Blue
    PATCH: "\x1b[96m", // Bright Cyan
    DELETE: "\x1b[91m", // Bright Red
  }
  const reset = "\x1b[0m"
  const yellow = "\x1b[93m" // Bright Yellow for time

  const coloredMethod = `${colors[method]}${method.padEnd(7)}${reset}` // <<< padEnd เพื่อ align

  const fullPath = `/api/${version}${path ?? ""}`

  console.log(
    `${yellow}[${timeString}]${reset} ${coloredMethod} ${FULL_HOSTNAME}${fullPath}`
  )
}
