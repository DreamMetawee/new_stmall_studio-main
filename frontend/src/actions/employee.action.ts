import { AuthSending } from "../utils/api"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

export const UPDATE_EMPLOYEE_ORDER = async (
  items: Array<{ id: number; order_step: number }>
) => {
  const response = await AuthSending().patch(
    `${API_ENDPOINT}${API_VERSION}pages/sale-team/update-order`,
    { items }
  )
  return response.data
}
