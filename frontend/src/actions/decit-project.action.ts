import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

async function GET_DECIT_PROJECTS() {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}decit-projects`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

async function GET_DECIT_PROJECT_BY_ID(id: number) {
  try {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}decit-projects/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

async function CREATE_DECIT_PROJECT(fornmData: FormData) {
  try {
    const response = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}decit-projects`,
      fornmData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

async function UPDATE_DECIT_PROJECT(id: number, formData: FormData) {
  try {
    const response = await AuthSending().patch(
      `${API_ENDPOINT}${API_VERSION}decit-projects/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

async function DELETE_DECIT_PROJECT(id: number) {
  try {
    const response = await AuthSending().delete(
      `${API_ENDPOINT}${API_VERSION}decit-projects/${id}`
    )
    return response.data
  } catch (err) {
    console.log(err)
  }
}

export {
  GET_DECIT_PROJECTS,
  GET_DECIT_PROJECT_BY_ID,
  CREATE_DECIT_PROJECT,
  UPDATE_DECIT_PROJECT,
  DELETE_DECIT_PROJECT,
}
