import { useEffect, useState } from "react"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import InPaymentDetial from "../../components/support/inpayment/InPaymentDetial"
import InpaymentList from "../../components/support/inpayment/InpaymentList"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { InPaymentProps } from "../../props/Inpayment"

export default function Inpayment() {
  const [inPayments, setInPayments] = useState<InPaymentProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | null>(null)

  const fetchInPayments = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}inpayment`
      )

      const { data } = response
      if (data) {
        setInPayments(data)
        setTargetSelection(data[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchInPayments()
  }, [])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} | การชำระเงิน`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="การชำระเงิน" />

      <div className="flex h-full flex-col gap-6 sm:gap-5 xl:flex-row">
        <InpaymentList
          listData={inPayments}
          targetId={targetSelection?.id}
          setTarget={setTargetSelection}
        />
        <InPaymentDetial target={targetSelection} />
      </div>
    </div>
  )
}
