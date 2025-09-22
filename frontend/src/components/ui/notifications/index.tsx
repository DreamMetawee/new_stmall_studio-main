import React from "react"
import Button from "../button/Button"

interface UpdateNotificationProps {
  icon?: React.ReactNode
  title: string
  message: string
  onLater: () => void
  onUpdate: () => void
  laterText?: string
  updateText?: string
  className?: string
  buttonSize?: "xs" | "sm" | "md"
}

const Notify: React.FC<UpdateNotificationProps> = ({
  icon,
  title,
  message,
  onLater,
  onUpdate,
  laterText = "Later",
  updateText = "Update Now",
  className = "",
  buttonSize = "sm",
}) => {
  return (
    <div
      className={`w-full max-w-[500px] rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1E2634] ${className}`}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="text-brand-500">{icon}</div>}
        <div className="flex flex-1 flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h5 className="mb-1 text-base font-medium text-gray-800 dark:text-white/90">
              {title}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
          <div className="flex w-full items-center gap-3 sm:max-w-fit">
            <Button
              className="flex-1 sm:flex-none"
              size={buttonSize}
              variant="outline"
              isButton
              onClick={onLater}
            >
              {laterText}
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              size={buttonSize}
              variant="primary"
              isButton
              onClick={onUpdate}
            >
              {updateText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notify
