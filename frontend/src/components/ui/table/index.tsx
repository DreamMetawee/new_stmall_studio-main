import React, { ReactNode } from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ErrorIcon,
  PlusIcon,
  SearchIcon,
} from "../../../icons"
import Button from "../button/Button"
import Select from "../../form/Select"
import Input from "../../form/input/InputField"
import { Link } from "react-router"

// Props for Table
interface TableProps {
  children: ReactNode // Table content (thead, tbody, etc.)
  className?: string // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode // Header row(s)
  className?: string // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode // Body row(s)
  className?: string // Optional className for styling
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode // Cells (th or td)
  className?: string // Optional className for styling
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode // Cell content
  isHeader?: boolean // If true, renders as <th>, otherwise <td>
  className?: string // Optional className for styling
  colSpan?: number
}

interface TableControlProps {
  perPageLimit: number
  setPerPage: (value: number) => void
  search?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  showSearch?: boolean
  options?: number[]
  onClick?: () => void
  showOnClick?: boolean
  buttonText?: string
  disable?: boolean
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
}

export const tableCellStyle = {
  th: `text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400`,
  td: `text-theme-sm px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400`,
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full ${className}`}>{children}</table>
}

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>
}

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>
}

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>
}

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
}) => {
  const CellTag = isHeader ? "th" : "td"
  return (
    <CellTag className={` ${className}`} colSpan={colSpan}>
      {children}
    </CellTag>
  )
}

const TableControl: React.FC<TableControlProps> = ({
  perPageLimit,
  setPerPage,
  search,
  onSearch,
  searchPlaceholder = "ค้นหา",
  showSearch = true,
  options = [10, 20, 50, 100],
  onClick,
  showOnClick = true,
  buttonText = "เพิ่มข้อมูลใหม่",
  disable = false,
}) => {
  const handleSelectChange = (value: string) => {
    setPerPage(Number(value))
  }

  return (
    <div className="mb-4 flex flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">แสดง</span>
        <div className="relative z-20 bg-transparent">
          <Select
            options={options.map(option => ({
              label: String(option),
              value: String(option),
            }))}
            onChange={handleSelectChange}
            defaultValue={String(perPageLimit)}
            className="dark:bg-dark-900"
          />
          <span className="absolute top-1/2 right-2 z-30 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400">รายการ</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showSearch && (
          <div className="relative">
            <button className="absolute top-1/2 left-4 z-1 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <SearchIcon />
            </button>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => onSearch?.(e.target.value)}
              className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[300px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              disabled={disable}
            />
          </div>
        )}
        {showOnClick &&
          (onClick ? (
            <Button
              variant="primary"
              size="sm"
              onClick={onClick}
              disabled={disable}
            >
              {buttonText}
              <PlusIcon />
            </Button>
          ) : (
            <Link to="?create=true" className="inline-flex items-center gap-2">
              <Button variant="primary" size="sm">
                {buttonText}
                <PlusIcon />
              </Button>
            </Link>
          ))}
      </div>
    </div>
  )
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalItems)

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-white/60">
            {totalItems > 0 && (
              <>
                แสดง <span className="font-medium">{startItem}</span> ถึง{" "}
                <span className="font-medium">{endItem}</span> จาก{" "}
                <span className="font-medium">{totalItems}</span> รายการ
              </>
            )}
          </p>
        </div>

        <div className="flex">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalItems === 0}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

const EmptyCell: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1">
      <ErrorIcon className="animate-pulse" /> ไม่พบข้อมูล
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableControl,
  Pagination,
  EmptyCell,
}
