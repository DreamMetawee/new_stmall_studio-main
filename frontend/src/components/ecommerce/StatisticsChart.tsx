import Chart from "react-apexcharts"
import { ApexOptions } from "apexcharts"
import { useEffect, useState } from "react"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import { AuthSending } from "../../utils/api"

export default function StatisticsChart() {
  const [series, setSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AuthSending().get(
          `${API_ENDPOINT}${API_VERSION}dashboard/metrics/visitors-monthly`
        )
        const { data } = res.data // data is { year: [monthCounts] }

        // แปลง object data เป็น array series ตามปี (เรียงปีจากน้อยไปมาก หรือมากไปน้อย)
        const years = Object.keys(data)
          .map(Number)
          .sort((a, b) => a - b) // จากน้อยไปมาก

        const seriesData = years.map(year => ({
          name: `${year}`,
          data: data[year],
        }))

        setSeries(seriesData)
      } catch (error) {
        console.error("Error fetching visitors data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const options: ApexOptions = {
    legend: {
      show: true, // เปิด legend เพื่อดูปีต่าง ๆ
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF", "#F87171", "#34D399", "#FBBF24"], // เพิ่มสีให้พอสำหรับ 5 ปี
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: Array(series.length).fill(2),
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "dd MMM yyyy" },
    },
    xaxis: {
      type: "category",
      categories: [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: { fontSize: "0px" },
      },
    },
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            สถิติจำนวนผู้เข้าชม
          </h3>
        </div>
      </div>

      <div className="custom-scrollbar max-w-full overflow-x-auto">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  )
}
