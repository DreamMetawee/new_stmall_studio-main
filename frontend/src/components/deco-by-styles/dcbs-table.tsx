import { SquarePenIcon, TrashBinIcon } from "../../icons"
import Button from "../ui/button/Button"
import {
  Table,
  TableBody,
  TableCell,
  tableCellStyle,
  TableControl,
  TableHeader,
  TableRow,
} from "../ui/table"
import { useTableControl } from "../../hooks/useTableControl"
import { useEffect, useState } from "react"
import { DecoByStyleProps } from "../../props/DecoByStyle"
import {
  DeleteDCBSById,
  GetAllDecoByStyles,
} from "../../actions/decobystyles.action"
import Badge from "../ui/badge/Badge"
import { useNavigate } from "react-router"
import { Modal } from "../ui/modal"
import { useModal } from "../../hooks/useModal"
import DeleteDiaglog from "../common/DeleteDiaglog"
import { toast } from "react-toastify"
import { handleImageError } from "../../utils/image"
import { getImageUrl } from "../../utils/helper"

const LIMIT_DECOBYSTYLES: number = 10

const DecoByStylesTable = () => {
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()

  const [decoByStyle, setDecoByStyle] = useState<DecoByStyleProps[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  const fetchData = async () => {
    const data = (await GetAllDecoByStyles()) || []
    setDecoByStyle(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const { searchTerm, onSearch, currentPage, perPage, setPerPage, paginated } =
    useTableControl(decoByStyle, 10)

  const handlerDelete = async () => {
    const resp = await DeleteDCBSById(Number(selected?.id))
    if (resp.success) {
      toast.success(resp.message)
      setDecoByStyle(prev => prev.filter(i => i.id !== Number(selected.id)))
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto pt-4">
        <TableControl
          perPageLimit={perPage}
          setPerPage={setPerPage}
          search={searchTerm}
          onSearch={onSearch}
          options={[10]}
          onClick={() => navigate("/decobystyles?mode=create")}
          buttonText={
            decoByStyle.length === 10
              ? `ครบจำนวนที่กำหนดแล้ว`
              : `จำกัด ${decoByStyle.length}/${LIMIT_DECOBYSTYLES} สไตล์`
          }
        />

        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                #
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                รูปภาพ
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                ชื่อสไตล์
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                จำนวนหมวดหมู่ย่อย
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginated.length > 0 ? (
              paginated.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    {(currentPage - 1) * perPage + index + 1}
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <figure className="max-w-40">
                      <img
                        src={getImageUrl("decobystyles", item.image)}
                        alt="preview"
                        className="h-full w-full rounded-lg object-cover"
                        onError={e => handleImageError(e, "blank")}
                      />
                    </figure>
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    {item.name}
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <Badge
                      size="sm"
                      variant="light"
                      color={`${item.item_count > 0 ? "primary" : "light"}`}
                    >
                      {item.item_count} รายการ
                    </Badge>
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <div className="inline-flex gap-1">
                      <Button
                        onClick={() =>
                          navigate(`/decobystyles?mode=edit&v=${item.id}`)
                        }
                        size="xs"
                        variant="outline"
                      >
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          setSelected(item)
                          openModal()
                        }}
                      >
                        <TrashBinIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-4 text-center">ไม่พบข้อมูล</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className={`mb-4 max-w-[507px]`}
      >
        <DeleteDiaglog
          target={selected}
          text="(หมวดหมู่ย่อยทั้งหมดในสไตล์นี้จะถูกลบ)"
          onDelete={handlerDelete}
          onClose={closeModal}
          prefix="สินค้าตามสไตล์"
        />
      </Modal>
    </div>
  )
}

export default DecoByStylesTable
