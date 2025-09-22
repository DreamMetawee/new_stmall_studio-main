import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const CreateSubDecoByStyles = async (payload: FormData) => {
  try {
    const response = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}subdcbs`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const UpdateSubDecoByStyles = async (
  sub_dcbs: number,
  payload: FormData
) => {
  try {
    const response = await AuthSending().patch(
      `${API_ENDPOINT}${API_VERSION}subdcbs/${sub_dcbs}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const DeleteSubDCBSById = async (id: number) => {
  try {
    const response = await AuthSending().delete(
      `${API_ENDPOINT}${API_VERSION}subdcbs/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}
