import React, { useEffect, useRef } from "react"
import Quill from "quill"
import "quill/dist/quill.snow.css"

interface QuillEditorProps {
  value: string
  onChange: (content: string) => void
  className?: string
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["link"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ]

  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
      })

      quillRef.current.root.innerHTML = value

      quillRef.current.on("text-change", () => {
        if (quillRef.current) {
          onChange(quillRef.current.root.innerHTML)
        }
      })

      initializedRef.current = true
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change", () => {})
        quillRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (
      quillRef.current &&
      value !== quillRef.current.root.innerHTML &&
      initializedRef.current
    ) {
      quillRef.current.root.innerHTML = value
    }
  }, [value])

  return (
    <div>
      <div ref={editorRef} className={`text-base ${className}`} />
    </div>
  )
}

export default QuillEditor
