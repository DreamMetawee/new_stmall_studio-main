import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const GetAllDecoByStyles = async () => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}dcbs`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const GetDecoByStyleWithId = async (dcbsId: number) => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}dcbs/${dcbsId}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const CreateDecoByStyle = async (payload: FormData) => {
  try {
    const response = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}dcbs`,
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

export const UpdateDecoByStyle = async (dcbsId: number, payload: FormData) => {
  try {
    const response = await AuthSending().patch(
      `${API_ENDPOINT}${API_VERSION}dcbs/${dcbsId}`,
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

export const DeleteDCBSById = async (id: number) => {
  try {
    const response = await AuthSending().delete(
      `${API_ENDPOINT}${API_VERSION}dcbs/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}
