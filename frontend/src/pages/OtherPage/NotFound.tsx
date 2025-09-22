import GridShape from "../../components/common/GridShape"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import useGoBack from "../../hooks/useGoBack"
import Button from "../../components/ui/button/Button"

export default function NotFound() {
  const goBack = useGoBack()

  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | ดูเหมือนหน้านี้จะมีปัญหา`}
        description={WEBSITE_DESCRIPTION}
      />
      <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
        <GridShape />
        <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
          <h1 className="text-title-md xl:text-title-2xl mb-8 font-bold text-gray-800 dark:text-white/90">
            เกิดข้อผิดพลาด
          </h1>

          <img src="/images/error/404.svg" alt="404" className="dark:hidden" />
          <img
            src="/images/error/404-dark.svg"
            alt="404"
            className="hidden dark:block"
          />

          <p className="mt-10 mb-6 text-base text-gray-700 sm:text-lg dark:text-gray-400">
            เราไม่พบหน้าที่คุณกำลังมองหา
          </p>

          <Button onClick={goBack}>กลับหน้าหลัก</Button>
        </div>
        {/* <!-- Footer --> */}
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} - TailAdmin
        </p>
      </div>
    </>
  )
}
