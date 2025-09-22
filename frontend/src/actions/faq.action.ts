import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const GET_FAQ_LIST = async () => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}faqs`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const GET_FAQ_BY_ID = async (id: number) => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}faqs/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const POST_FAQ = async (data: { question: string; answer: string }) => {
  try {
    const response = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}faqs`,
      data
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const PATCH_FAQ = async (
  id: number,
  data: { question: string; answer: string }
) => {
  try {
    const response = await AuthSending().put(
      `${API_ENDPOINT}${API_VERSION}faqs/${id}`,
      data
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const DELETE_FAQ = async (id: number) => {
  try {
    const response = await AuthSending().delete(
      `${API_ENDPOINT}${API_VERSION}faqs/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}
