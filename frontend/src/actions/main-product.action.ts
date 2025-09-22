import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const GetMainProducts = async () => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}products`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const GetMainProductById = async (id: number) => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}products/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const DeleteMainProductById = async (id: number) => {
  try {
    const response = await AuthSending().delete(
      `${API_ENDPOINT}${API_VERSION}products/delete/${id}`
    )
    const { data } = response

    if (!data.success) throw new Error(response.data.message)

    return data
  } catch (error: any) {
    console.error(error)
  }
}
