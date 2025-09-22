import { PrinterIcon, TrashBinIcon } from "../../../icons"
import { InPaymentProps } from "../../../props/Inpayment"
import { formatPhoneNumber } from "../../../utils/string"
import Button from "../../ui/button/Button"

interface InPaymentDetialProps {
  target: InPaymentProps | null
}

const InPaymentDetial: React.FC<InPaymentDetialProps> = ({ target }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white xl:w-4/5 dark:border-gray-800 dark:bg-white/[0.03]">
      {target ? (
        <>
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
              รายละเอียด
            </h3>
            <h4 className="text-base font-medium text-gray-700 dark:text-gray-400">
              เลขที่คำสั่งซื้อ: {target?.payment_id}
            </h4>
          </div>
          <div className="p-5 xl:p-8">
            <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  ชื่อผู้ชำระ
                </span>
                <h5 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
                  {target?.customer_name}
                </h5>
                <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  ช่องทางการติดต่อ
                </span>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {target?.email} <br />
                  {formatPhoneNumber(String(target?.phone))}
                </p>
                <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  จำนวนเงิน
                </span>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {Number(target?.amount).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  บาท
                </p>
                <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  หมายเหตุ
                </span>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {target?.details}
                </p>
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    วันที่โอนเงิน - เวลาที่โอนเงิน
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    {target?.payment_date} - {target?.payment_time}
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 sm:h-[158px] sm:w-px dark:bg-gray-800" />
              <div className="sm:text-right">
                <img
                  src="https://www.kasikornbank.com/SiteCollectionDocuments/International-business/global-money-transfer/international-transferviakplus/img/Transfer-Account-SWIFT_14.png"
                  alt=""
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:text-error-500"
              >
                <TrashBinIcon />
              </Button>
              <div className="inline-flex gap-2">
                <Button variant="outline" size="sm">
                  ดาวน์โหลด
                </Button>
                <Button size="sm">
                  <PrinterIcon />
                  พิมพ์
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-full w-full items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
            ไม่มีข้อมูล
          </h3>
        </div>
      )}
    </div>
  )
}
export default InPaymentDetial
