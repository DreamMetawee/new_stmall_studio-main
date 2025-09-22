import {
  MainCategoryProps,
  ProductTypeProps,
  SubCategoryProps,
} from "../../../props/Groups"
import Button from "../../ui/button/Button"

interface DeleteCategoryDialogProps {
  target: MainCategoryProps | SubCategoryProps | ProductTypeProps | undefined
  onDelete: () => void
  onClose: () => void
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  target,
  onDelete,
  onClose,
}) => {
  return (
    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="text-center">
        <h4 className="sm:text-title-sm mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          ยืนยันการลบข้อมูล
        </h4>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          หมวดหมู่ <strong className="text-blue-500">{target?.name}</strong>{" "}
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </div>
      <div className="mt-8 flex w-full items-center justify-center gap-3">
        <Button
          disabled={!target}
          onClick={() => {
            onDelete(), onClose()
          }}
          size="sm"
        >
          ยืนยัน
        </Button>
        <Button onClick={onClose} variant="outline" size="sm">
          ยกเลิก
        </Button>
      </div>
    </div>
  )
}
export default DeleteCategoryDialog
