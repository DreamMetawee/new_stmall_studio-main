import { createContext, useContext, useState } from "react"

type PageUpdateContextType = {
  isDirty: boolean
  setDirty: (value: boolean) => void
}

const PageUpdateContext = createContext<PageUpdateContextType | undefined>(
  undefined
)

export const PageUpdateProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isDirty, setIsDirty] = useState(false)

  const setDirty = (value: boolean) => {
    setIsDirty(value)
  }

  return (
    <PageUpdateContext.Provider value={{ isDirty, setDirty }}>
      {children}
    </PageUpdateContext.Provider>
  )
}

export const usePageUpdate = () => {
  const context = useContext(PageUpdateContext)
  if (!context) {
    throw new Error("usePageUpdate must be used within a PageUpdateProvider")
  }
  return context
}
