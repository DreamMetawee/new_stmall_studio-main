import { DecoByStyleProps } from "../../props/DecoByStyle"
import DecoByStyleDetails from "./dcbs-details"
import DecoByStyleDetailLists from "./dcbs-detail-list"
import { ListProps } from "../../pages/DecoByStyles/DecoByStyles"

interface DecoByStyleFormProps {
  mode: "create" | "edit"
  existingData?: Pick<DecoByStyleProps, "id" | "image" | "name"> & {
    lists: ListProps[]
  }
}

const DecoByStyleForm: React.FC<DecoByStyleFormProps> = ({
  mode = "create",
  existingData,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
      <DecoByStyleDetails mode={mode} data={existingData} />
      <DecoByStyleDetailLists dataLists={existingData?.lists} />
    </div>
  )
}
export default DecoByStyleForm
