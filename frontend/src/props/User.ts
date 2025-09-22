export interface UserProps {
  id: string
  name: string
  nickname: string
  permission: "member" | "admin"
  username: string
  phone: string
  avatar: string
  status: boolean
}