import { useEffect, useRef, useState } from "react"
import Input from "../../form/input/InputField"

interface ComboBoxProps {
  className?: string
  data: any
  onSelect?: (item: number) => void
  disabled?: boolean
  defaultId?: number // 👈 เพิ่ม prop ตรงนี้
  error?: boolean
  hint?: string
}

const ComboBox: React.FC<ComboBoxProps> = ({
  data,
  onSelect,
  className,
  disabled,
  defaultId,
  error,
  hint,
}) => {
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFilteredData(data)

    // ถ้ามี defaultId ให้หา item ที่ตรงกันแล้วเซตชื่อให้โชว์
    if (defaultId) {
      const defaultItem = data.find((item: any) => item.id === defaultId)
      if (defaultItem) {
        setSearchTerm(defaultItem.name)
      }
    }
  }, [data, defaultId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    const filtered = data.filter((item: any) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredData(filtered)
    setShowDropdown(true)
  }

  const handleSelect = (item: any) => {
    setSearchTerm(item.name)
    onSelect?.(item.id)
    setShowDropdown(false)
    inputRef.current?.blur()
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowDropdown(false)
      }
    }, 100)
  }

  return (
    <div
      className={`relative w-full ${className}`}
      ref={containerRef}
      onBlur={handleBlur}
      tabIndex={-1} // ต้องมีเพื่อให้ div รับ focus ได
    >
      <div className="relative mb-2">
        <Input
          disabled={disabled}
          ref={inputRef}
          onFocus={() => {
            // เคลียร์เมื่อ user กลับมา focus เพื่อเลือกใหม่
            if (searchTerm !== "") {
              setSearchTerm("")
              setFilteredData(data)
            }
            setShowDropdown(true)
          }}
          value={searchTerm}
          placeholder="ค้นหา"
          onChange={handleInputChange}
          error={error}
          hint={hint}
        />
      </div>

      {showDropdown && filteredData.length > 0 && (
        <div className="absolute z-10 max-h-[200px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-800">
          <ul className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
            {filteredData.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className="hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-500/[0.12] dark:hover:text-brand-400 flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ComboBox
