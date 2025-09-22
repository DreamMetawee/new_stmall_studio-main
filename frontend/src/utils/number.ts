export const formatNumber = (number: number) =>
  Number(number.toFixed(2)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
