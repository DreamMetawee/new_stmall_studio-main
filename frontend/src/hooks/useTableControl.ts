import { useMemo, useState } from "react"

export function useTableControl<T>(data: T[], defaultPerPage = 10) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(defaultPerPage)

  const filtered = useMemo(() => {
    return data.filter((item: any) => {
      const name = typeof item.name === "string" ? item.name.toLowerCase() : ""
      const image =
        typeof item.image === "string" ? item.image.toLowerCase() : ""
      const term = searchTerm.toLowerCase()
      return name.includes(term) || image.includes(term)
    })
  }, [searchTerm, data])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage
    const end = start + perPage
    return filtered.slice(start, end)
  }, [filtered, currentPage, perPage])

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage)

  const onSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    onSearch,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    filtered,
    paginated,
    totalItems,
    totalPages,
  }
}
