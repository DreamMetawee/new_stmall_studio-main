import SaleTeamTable from "../tables/SaleTeamTables/SaleTeamTable"

const SaleTeam = () => {
  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <h3 className="text-theme-xl font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
              บุคคลากร
            </h3>
          </div>

          <div className="col-span-2">
            <SaleTeamTable />
          </div>
        </div>
      </div>
    </div>
  )
}
export default SaleTeam
