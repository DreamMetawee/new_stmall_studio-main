import { useState } from "react"
import {
  ArrowLeftIcon,
  PlusIcon,
  SearchIcon,
  SquarePenIcon,
  TrashBinIcon,
} from "../../icons"
import Input from "../form/input/InputField"
import Button from "../ui/button/Button"
import { Card, CardActions, CardBody, CardImage } from "../ui/cards"
import { ServiceItemProps } from "../../props/Page"
import { Modal } from "../ui/modal"
import { useModal } from "../../hooks/useModal"
import { useNavigate } from "react-router"
import Alert from "../ui/alert/Alert"
import CreateServiceItemForm from "./CreateServiceItemForm"
import { toast } from "react-toastify"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import DeleteDiaglog from "../common/DeleteDiaglog"

interface ServiceItemPageProps {
  reFetching: () => void
  serviceId: string
  items?: ServiceItemProps[]
}

const ServiceItems: React.FC<ServiceItemPageProps> = ({
  reFetching,
  serviceId,
  items,
}) => {
  const { closeModal, isOpen, openModal } = useModal()
  const [targetSelected, setTargetSelected] = useState<any | undefined>(
    undefined
  )
  const [modalType, setModalType] = useState<
    "create" | "edit" | "delete" | null
  >(null)
  const [searchTerm, setSearchTerm] = useState("")

  const navigate = useNavigate()

  const openCreateModal = () => {
    setTargetSelected(undefined)
    setModalType("create")
    openModal()
  }

  const openEditModal = (service: ServiceItemProps) => {
    setTargetSelected(service)
    setModalType("edit")
    openModal()
  }

  const openDeleteModal = (service: ServiceItemProps) => {
    setTargetSelected(service)
    setModalType("delete")
    openModal()
  }

  const closeModalHandler = () => {
    setTargetSelected(undefined)
    setModalType(null)
    closeModal()
    navigate(`/decit/${serviceId}`)
  }

  const filteredItems = items?.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}pages/service-item/delete/${targetSelected?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        reFetching()
      } else throw new Error(response.data.message)
    } catch (error: any) {
      console.error(error)
      toast.update(toastId, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      closeModalHandler()
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1140px] space-y-6">
        <div className="mx-auto flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/decit")}
          >
            <ArrowLeftIcon /> ย้อนกลับ
          </Button>
          <div className="flex gap-2">
            <div className="relative">
              <button className="absolute top-1/2 left-4 z-1 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <SearchIcon />
              </button>
              <Input
                type="text"
                placeholder="ค้นหาบริการ"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
            <Button size="sm" onClick={openCreateModal}>
              เพิ่มหมวดหมู่บริการใหม่ <PlusIcon />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {filteredItems?.length === 0 ? (
            <div className="col-span-full">
              <Alert
                variant="info"
                title="ไม่พบข้อมูล"
                message={`${searchTerm ? "ไม่พบรายการที่คุณค้นหา" : "ดูเหมือนว่าหมวดหมู่บริการนี้จะว่างเปล่า"}`}
                showLink={false}
              />
            </div>
          ) : (
            filteredItems?.map((service, index) => (
              <div key={index}>
                <Card>
                  <CardImage
                    className="flex items-center justify-center"
                    src={`${PUBLIC_STATIC}service-items/${service.image_path}`}
                  />
                  <CardBody title={service.name}>
                    {service.description}
                  </CardBody>
                  <CardActions className="flex items-center justify-end">
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(service)}
                      >
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => openDeleteModal(service)}
                      >
                        <TrashBinIcon />
                      </Button>
                    </div>
                  </CardActions>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModalHandler}
        className={`mb-4 ${modalType === "create" || modalType === "edit" ? "max-w-[700px]" : "max-w-[507px]"}`}
      >
        {(modalType === "create" || modalType === "edit") && (
          <CreateServiceItemForm
            serviceId={serviceId}
            onClose={closeModalHandler}
            reFetching={reFetching}
            editData={modalType === "edit" ? targetSelected : undefined}
          />
        )}

        {modalType === "delete" && (
          <DeleteDiaglog
            prefix="งานบริการ"
            target={targetSelected}
            onDelete={handlerDelete}
            onClose={closeModalHandler}
          />
        )}
      </Modal>
    </>
  )
}

export default ServiceItems
