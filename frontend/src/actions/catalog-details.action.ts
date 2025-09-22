import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const GetAllCatalogDetail = async () => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}catalog`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const GetCatalogDetailWithId = async (catalogId: number) => {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}catalog/${catalogId}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export const CreateCatalogDetail = async (payload: FormData) => {
  try {
    const response = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}catalog/create`,
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

export const UpdateCatalogDetail = async (catalog_id: number, payload: FormData) => {
  try {
    const response = await AuthSending().patch(
      `${API_ENDPOINT}${API_VERSION}catalog/update/${catalog_id}`,
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

export const DeleteCatalogDetailById = async (id: number) => {
  try {
    const response = await AuthSending().delete(
      `${API_ENDPOINT}${API_VERSION}catalog/delete/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
    return { success: false, message: "เกิดข้อผิดพลาด" } // ✅ เพิ่ม return
  }
}
