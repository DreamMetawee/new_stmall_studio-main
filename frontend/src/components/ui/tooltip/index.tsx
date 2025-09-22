interface TooltipProps {
  children: React.ReactNode
  tip: string
  size?: "xs" | "sm" | "md"
  variant?: "primary" | "outline"
  theme?: "light" | "dark"
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  tip,
  size = "md",
  variant = "primary",
  theme = "light",
}) => {
  const sizeClasses = {
    xs: "px-3 py-2 text-sm",
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  }

  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  }

  const themeClasses = {
    light: "bg-white text-gray-700",
    dark: "bg-[#1E2634] text-white",
  }

  return (
    <div className="group relative inline-block">
      <button
        className={`shadow-theme-xs inline-flex rounded-lg ${
          sizeClasses[size]
        } ${variantClasses[variant]}`}
      >
        {children}
      </button>
      <div
        className={`invisible absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100`}
      >
        <div className="relative">
          <div
            className={`drop-shadow-4xl rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap ${themeClasses[theme]}`}
          >
            {tip}
          </div>
          <div
            className={`drop-shadow-4xl absolute -bottom-1 left-1/2 h-3 w-4 -translate-x-1/2 rotate-45 ${themeClasses[theme]}`}
          ></div>
        </div>
      </div>
    </div>
  )
}
