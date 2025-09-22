import { useMemo, useState } from "react"
import { SearchIcon, SliderHorizontalIcon } from "../../../icons"
import { InPaymentProps } from "../../../props/Inpayment"
import { EmptyCell } from "../../ui/table"
import Button from "../../ui/button/Button"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"

interface InpaymentListProps {
  listData: InPaymentProps[]
  targetId?: number
  setTarget: (payment: InPaymentProps) => void
}

const InpaymentList: React.FC<InpaymentListProps> = ({
  listData,
  targetId,
  setTarget,
}) => {
  const { isOpen, openModal, closeModal } = useModal()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredList = useMemo(() => {
    return listData.filter(payment => {
      const search = searchTerm.toLowerCase()
      return (
        payment.customer_name.toLowerCase().includes(search) ||
        payment.payment_id.toLowerCase().includes(search)
      )
    })
  }, [listData, searchTerm])

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 xl:w-1/5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5 w-full">
          <form onSubmit={e => e.preventDefault()}>
            <div className="inline-flex gap-1.5">
              <div className="relative">
                <button className="absolute top-1/2 left-4 -translate-y-1/2">
                  <SearchIcon />
                </button>
                <input
                  placeholder="ค้นหา"
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-3.5 pl-[42px] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={openModal} size="sm" variant="outline">
                <SliderHorizontalIcon />
              </Button>
            </div>
          </form>
        </div>
        <div className="space-y-1">
          {filteredList.length > 0 ? (
            filteredList.map(payment => (
              <div
                onClick={() => setTarget(payment)}
                key={payment.id}
                className={`${
                  payment.id === targetId && "bg-gray-100 dark:bg-white/[0.03]"
                } flex cursor-pointer items-center gap-3 rounded-lg p-2 select-none hover:bg-gray-100 dark:hover:bg-white/[0.03]`}
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
                  <img
                    alt="user"
                    src="/Logo-new-K-PLUS.jpg"
                    className="h-16 w-16 object-cover object-center"
                  />
                </div>
                <div>
                  <span className="mb-0.5 block text-sm font-medium text-gray-800 dark:text-white/90">
                    {payment.customer_name}
                  </span>
                  <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                    เลขที่คำสั่งซื้อ: {payment.payment_id}
                  </span>
                  <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                    {payment?.payment_date} - {payment?.payment_time}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-lg bg-gray-100 p-2 hover:bg-gray-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.03]`}
            >
              <div>
                <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                  <EmptyCell />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              แก้ไขข้อมูลส่วนตัว
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  ข้อมูลส่วนตัว
                </h5>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button isButton size="sm" variant="outline" onClick={closeModal}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}
export default InpaymentList
