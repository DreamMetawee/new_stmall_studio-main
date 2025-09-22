import CatalogViewDetail from "./catalog-details"
import CatalogViewDetailLists from "./catalog-detail-list"
import { CatalogProps } from "../../props/Product"
import { CatalogListProps } from "../../pages/Products/Catalog"

interface CatalogFormProps {
  mode: "create" | "edit"
  existingData?: Pick<CatalogProps, "id" | "image" | "name" | "category_id"> & {
    lists: CatalogListProps[]
  }
}

const CatalogForm: React.FC<CatalogFormProps> = ({
  mode = "create",
  existingData,
}) => {
  return (
    <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
      <CatalogViewDetail mode={mode} data={existingData} />
      <CatalogViewDetailLists dataLists={existingData?.lists} />
    </div>
  )
}
export default CatalogForm
