import { useLocation } from "react-router"

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{3})(\d{6})/, "$1-$2")
}

export function formatThaiDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function useQueryParam(key: string): string | null {
  const { search } = useLocation()
  return new URLSearchParams(search).get(key)
}
