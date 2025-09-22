import { useNavigate } from "react-router"
import { useModal } from "../../hooks/useModal"
import { useEffect, useState } from "react"
import {
  DELETE_DECIT_PROJECT,
  GET_DECIT_PROJECTS,
} from "../../actions/decit-project.action"
import { useTableControl } from "../../hooks/useTableControl"
import { toast } from "react-toastify"
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  tableCellStyle,
  TableControl,
  TableHeader,
  TableRow,
} from "../ui/table"
import { getImageUrl } from "../../utils/helper"
import { handleImageError } from "../../utils/image"
import Button from "../ui/button/Button"
import { SquarePenIcon, TrashBinIcon } from "../../icons"
import { Modal } from "../ui/modal"
import DeleteDiaglog from "../common/DeleteDiaglog"
import { DECiTProjectProps } from "../../props/DECiTProject"

const DECiTProjectTable = () => {
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()

  const [decitProjects, setDecitProjects] = useState<DECiTProjectProps[]>([])
  const [selected, setSelected] = useState<DECiTProjectProps | null>(null)

  const fetchData = async () => {
    const data = (await GET_DECIT_PROJECTS()) || []
    setDecitProjects(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const {
    searchTerm,
    onSearch,
    currentPage,
    perPage,
    setPerPage,
    paginated,
    totalItems,
    totalPages,
    setCurrentPage,
  } = useTableControl(decitProjects, 10)

  const handlerDelete = async () => {
    const resp = await DELETE_DECIT_PROJECT(Number(selected?.id))
    if (resp.success) {
      toast.success(resp.message)
      setDecitProjects(prev => prev.filter(i => i.id !== Number(selected?.id)))
    }
  }

  return (
    <div className="mx-auto max-w-[960px] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto pt-4">
        <TableControl
          perPageLimit={perPage}
          setPerPage={setPerPage}
          search={searchTerm}
          onSearch={onSearch}
          onClick={() => navigate("/decit-projects?mode=create")}
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
                ชื่องาน
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                รายละเอียด
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
                        src={getImageUrl("projects", String(item.image))}
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
                    <div
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <div className="inline-flex gap-1">
                      <Button
                        onClick={() =>
                          navigate(`/decit-projects?mode=edit&v=${item.id}`)
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className={`mb-4 max-w-[507px]`}
      >
        <DeleteDiaglog
          target={{
            id: String(selected?.id),
            name: selected?.name,
          }}
          onDelete={handlerDelete}
          onClose={closeModal}
          prefix="ผลงานช่าง"
        />
      </Modal>
    </div>
  )
}
export default DECiTProjectTable
