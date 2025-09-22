interface ResponsiveImageProps {
  src?: string
  alt?: string
  className?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

export default function ResponsiveImage({
  src,
  alt,
  className,
  onError,
}: ResponsiveImageProps) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img
          src={`${src || "/images/grid-image/image-01.png"}`}
          alt={`${alt || "Cover"}`}
          className={`w-full rounded-xl border border-gray-200 dark:border-gray-800 ${className ?? ""}`}
          onError={onError}
        />
      </div>
    </div>
  )
}
