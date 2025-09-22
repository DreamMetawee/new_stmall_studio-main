import { useEffect, useState } from "react"
import { PlusIcon, SearchIcon, SquarePenIcon, TrashBinIcon } from "../../icons"
import Input from "../form/input/InputField"
import Button from "../ui/button/Button"
import { Card, CardActions, CardBody, CardImage } from "../ui/cards"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../utils/meta"
import { ServiceCategoryProps } from "../../props/Page"
import { Modal } from "../ui/modal"
import { useModal } from "../../hooks/useModal"
import CreateServicesForm from "./CreateServicesForm"
import { useQueryParam } from "../../utils/string"
import { useNavigate } from "react-router"
import Alert from "../ui/alert/Alert"
import DeleteDiaglog from "../common/DeleteDiaglog"
import { toast } from "react-toastify"

const ServiceList = () => {
  const { closeModal, isOpen, openModal } = useModal()
  const [services, setServices] = useState<ServiceCategoryProps[]>([])
  const [targetSelected, setTargetSelected] = useState<any | undefined>(
    undefined
  )
  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "delete" | null
  >(null)
  const [searchTerm, setSearchTerm] = useState("")

  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  const fetchServices = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}pages/services`
      )
      setServices(response.data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const closeModalHandler = () => {
    setTargetSelected(undefined)
    setModalMode(null)
    closeModal()
    navigate("/decit")
  }

  useEffect(() => {
    if (isCreate) {
      setModalMode("create")
      openModal()
    }
  }, [isCreate])

  const filteredItems = services?.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}pages/services/delete/${targetSelected?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setServices(prev => prev.filter(item => item.id !== targetSelected?.id))
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
        <div className="mx-auto flex max-w-[640px] gap-2">
          <div className="relative flex-1">
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
          <Button
            size="sm"
            onClick={() => {
              navigate("/decit?create=true")
            }}
          >
            เพิ่มบริการใหม่ <PlusIcon />
          </Button>
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
            filteredItems.map((services, index) => (
              <div key={index} className="col-span-2 lg:col-span-1">
                <Card>
                  <CardImage
                    className="flex items-center justify-center"
                    src={`${PUBLIC_STATIC}services/${services.image_path}`}
                  />
                  <CardBody title={services.name}>
                    {services.description}
                  </CardBody>
                  <CardActions className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/decit/${services.id}`)}
                    >
                      ดูบริการทั้งหมด
                    </Button>
                    <div className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTargetSelected(services)
                          setModalMode("edit")
                          openModal()
                        }}
                      >
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          setTargetSelected(services)
                          setModalMode("delete")
                          openModal()
                        }}
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
        className={`mb-4 ${modalMode === "edit" || modalMode === "create" ? "max-w-[700px]" : "max-w-[507px]"}`}
      >
        {modalMode === "create" || modalMode === "edit" ? (
          <CreateServicesForm
            onClose={closeModalHandler}
            reFetching={fetchServices}
            editData={modalMode === "edit" ? targetSelected : undefined}
          />
        ) : modalMode === "delete" ? (
          <DeleteDiaglog
            prefix="หมวดหมู่งานบริการ"
            target={targetSelected}
            onDelete={handlerDelete}
            onClose={closeModalHandler}
          />
        ) : null}
      </Modal>
    </>
  )
}

export default ServiceList
