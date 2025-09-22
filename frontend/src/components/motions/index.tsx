import { motion } from "motion/react"

interface TemplateProps {
  children: React.ReactNode
  duration?: number
  className?: string
}

const Template: React.FC<TemplateProps> = ({
  children,
  duration = 0.2,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
export default Template
