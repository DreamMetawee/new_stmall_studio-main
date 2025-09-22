import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const GET_HOW_TO_ORDER = async () => {
  const response = await AuthSending().get(
    `${API_ENDPOINT}${API_VERSION}how-to-order`
  )
  return response.data
}

export const GET_HOW_TO_ORDER_BY_ID = async (id: number) => {
  const response = await AuthSending().get(
    `${API_ENDPOINT}${API_VERSION}how-to-order/${id}`
  )
  return response.data
}

export const POST_HOW_TO_ORDER = async (payload: any) => {
  const isFormData = payload instanceof FormData
  const response = await AuthSending().post(
    `${API_ENDPOINT}${API_VERSION}how-to-order`,
    payload,
    {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    }
  )
  return response.data
}

export const PATCH_HOW_TO_ORDER = async (id: number, payload: any) => {
  const response = await AuthSending().put(
    `${API_ENDPOINT}${API_VERSION}how-to-order/${id}`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  )
  return response.data
}

export const UPDATE_HOW_TO_ORDER_ORDER = async (
  items: Array<{ id: number; order_step: number }>
) => {
  const response = await AuthSending().patch(
    `${API_ENDPOINT}${API_VERSION}how-to-order/update-order`,
    { items }
  )
  return response.data
}

export const DELETE_HOW_TO_ORDER = async (id: number) => {
  const response = await AuthSending().delete(
    `${API_ENDPOINT}${API_VERSION}how-to-order/${id}`
  )
  return response.data
}
