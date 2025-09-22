import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const CreateCatlogs = async (payload: FormData) => {
  try {
    const response = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}catalog-images`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return response.data
  } catch (err) {
    console.log(err)
    throw err
  }
}

export const UpdateCreateCatlogs = async (
  catalogId: number,
  payload: FormData
) => {
  try {
    const response = await AuthSending().patch(
      `${API_ENDPOINT}${API_VERSION}catalog-images/${catalogId}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return response.data
  } catch (err) {
    console.log(err)
    throw err
  }
}
