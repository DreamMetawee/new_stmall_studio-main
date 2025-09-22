export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement>,
  type: "profile" | "product" | "blank"
) => {
  const imageByType = {
    profile: "/blank-profile.png",
    product: "/blank-product.png",
    blank: "/blank-image.png",
  }
  const target = e.target as HTMLImageElement
  target.src = imageByType[type]
  target.onerror = null
}
