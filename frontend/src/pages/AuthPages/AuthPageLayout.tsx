import React from "react"
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900">
      <div className="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900">
        {children}
        <div className="hidden h-full w-full items-center bg-white lg:grid lg:w-1/2 dark:bg-white/5">
          <div className="flex h-full items-center rounded-2xl">
            <img
              src="/wallpaper/presentation.jpg"
              alt="wallpaper"
              className="rounded-4xl"
            />
          </div>
        </div>
        <div className="fixed right-6 bottom-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  )
}
