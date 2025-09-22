import {
  Table,
  TableBody,
  TableCell,
  tableCellStyle,
  TableHeader,
  TableRow,
} from "../ui/table"
import { useEffect, useState } from "react"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import { handleImageError } from "../../utils/image"
import { getImageUrl } from "../../utils/helper"
import { ArrowRightIcon, SquarePenIcon } from "../../icons"
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"
import { useNavigate } from "react-router"

interface Products {
  id: number
  name: string
  image: string
  categories: string[] // [หมวดหมู่หลัก, หมวดหมู่ย่อย, ประเภท]
  price: string // เช่น "2990.00 บาท"
  promotion_price: string // เช่น "2990.00 บาท"
  views: number
}

export default function RecentOrders() {
  const navigate = useNavigate()

  const [tableData, setTableData] = useState<Products[]>([])

  useEffect(() => {
    AuthSending()
      .get(`${API_ENDPOINT}${API_VERSION}dashboard/metrics/top-products`) // ปรับ URL ตาม structure ของคุณ
      .then(res => setTableData(res.data))
      .catch(err => console.error("Failed to fetch top products", err))
  }, [])

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pt-4 pb-3 sm:px-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            สินค้ายอดเข้าชมสูงสุด 10 รายการ
          </h3>
        </div>

        {1 + 1 == 3 && (
          <div className="flex items-center gap-3">
            <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              <svg
                className="fill-white stroke-current dark:fill-gray-800"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.29004 5.90393H17.7067"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17.7075 14.0961H2.29085"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                  fill=""
                  stroke=""
                  strokeWidth="1.5"
                />
                <path
                  d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                  fill=""
                  stroke=""
                  strokeWidth="1.5"
                />
              </svg>
              Filter
            </button>
            <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              See all
            </button>
          </div>
        )}
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className={tableCellStyle["th"]}>
                ข้อมูลสินค้า
              </TableCell>
              <TableCell isHeader className={tableCellStyle["th"]}>
                ราคาปกติ
              </TableCell>
              <TableCell isHeader className={tableCellStyle["th"]}>
                ราคาโปรโมชั่น
              </TableCell>
              <TableCell isHeader className={tableCellStyle["th"]}>
                จำนวนเข้าชม
              </TableCell>
              <TableCell isHeader className={tableCellStyle["th"]}>
                ทางลัด
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map(product => (
              <TableRow key={product.id} className="text-nowrap">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <img
                        src={`${getImageUrl("products", product.image)}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={e => handleImageError(e, "product")}
                      />
                    </div>
                    <div>
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {product.name}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-xs font-normal text-gray-400 dark:text-gray-400">
                        {product.categories[0]} <ArrowRightIcon />{" "}
                        {product.categories[1]} <ArrowRightIcon />{" "}
                        {product.categories[2]}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={tableCellStyle["td"]}>
                  <Badge color="primary">{product.price}</Badge>
                </TableCell>
                <TableCell className={tableCellStyle["td"]}>
                  <Badge color="error">{product.promotion_price}</Badge>
                </TableCell>
                <TableCell className={tableCellStyle["td"]}>
                  <Badge color="success">{product.views} ครั้ง</Badge>
                </TableCell>
                <TableCell className={tableCellStyle["td"]}>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      navigate(`/products?mode=edit&v=${product.id}`)
                    }
                  >
                    <SquarePenIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
