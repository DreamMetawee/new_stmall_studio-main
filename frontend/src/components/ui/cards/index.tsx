import React, { createContext, useContext } from "react"
import ResponsiveImage from "../images/ResponsiveImage"
import { handleImageError } from "../../../utils/image"

type CardVariant = "vertical" | "horizon"

interface CardContextProps {
  variant: CardVariant
}

const CardContext = createContext<CardContextProps>({ variant: "vertical" })
const useCard = () => useContext(CardContext)

interface CardProps {
  variant?: CardVariant
  children: React.ReactNode
  className?: string
}

interface CardIconProps {
  children: React.ReactNode
  className?: string
}

interface CardImageProps {
  src?: string
  alt?: string
  className?: string
}

interface CardBodyProps {
  title?: string
  children: React.ReactNode
  className?: string
}

interface CardActionsProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({
  variant = "vertical",
  className,
  children,
}) => {
  const classes = {
    vertical:
      "rounded-xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]",
    horizon:
      "flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:gap-6 dark:border-gray-800 dark:bg-white/[0.03]",
  }

  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`${classes[variant]} ${className || ""}`}>{children}</div>
    </CardContext.Provider>
  )
}

const CardIcon: React.FC<CardIconProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-brand-50 text-brand-500 dark:bg-brand-500/10 mb-5 flex h-14 max-w-14 items-center justify-center rounded-[10.5px] ${className || ""}`}
    >
      {children}
    </div>
  )
}

const CardImage: React.FC<CardImageProps> = ({ src, alt, className }) => {
  const { variant } = useCard()
  const imageWrapperClass = variant === "vertical" ? "mb-5" : "" // Remove margin for horizontal
  return (
    <div
      className={`${imageWrapperClass} overflow-hidden rounded-lg ${className || ""}`}
    >
      <ResponsiveImage
        src={src}
        alt={alt}
        onError={e => handleImageError(e, "blank")}
      />
    </div>
  )
}

const CardBody: React.FC<CardBodyProps> = ({ title, children, className }) => {
  return (
    <div className={className}>
      {title && (
        <h4 className="text-theme-xl font-medium text-gray-800 dark:text-white/90">
          {title}
        </h4>
      )}
      <div className="my-4 text-sm text-gray-500 dark:text-gray-400">
        {children}
      </div>
    </div>
  )
}

const CardActions: React.FC<CardActionsProps> = ({ children, className }) => {
  return (
    <div
      className={`inline-flex w-full flex-auto flex-wrap gap-2 ${className || ""}`}
    >
      {children}
    </div>
  )
}

export { Card, CardIcon, CardImage, CardBody, CardActions }
