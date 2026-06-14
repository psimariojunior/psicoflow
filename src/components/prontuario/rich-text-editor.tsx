"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { Bold, Italic, List, ListOrdered, Heading, Quote, Undo, Redo } from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "200px", className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ""
    }
  }, [])

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
      editorRef.current.focus()
    }
  }, [onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }, [])

  const clear = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = ""
      onChange("")
    }
  }, [onChange])

  const tools = [
    { icon: Bold, cmd: "bold", title: "Negrito" },
    { icon: Italic, cmd: "italic", title: "Itálico" },
    { type: "sep" as const },
    { icon: Heading, cmd: "formatBlock", value: "h3", title: "Título" },
    { type: "sep" as const },
    { icon: List, cmd: "insertUnorderedList", title: "Lista" },
    { icon: ListOrdered, cmd: "insertOrderedList", title: "Lista numerada" },
    { type: "sep" as const },
    { icon: Quote, cmd: "formatBlock", value: "blockquote", title: "Citação" },
    { type: "sep" as const },
    { icon: Undo, cmd: "undo", title: "Desfazer" },
    { icon: Redo, cmd: "redo", title: "Refazer" },
  ]

  return (
    <div
      className={cn(
        "rounded-xl border transition-all overflow-hidden",
        isFocused ? "border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5" : "border-input",
        className
      )}
    >
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        {tools.map((t, i) =>
          t.type === "sep" ? (
            <div key={i} className="w-px h-5 bg-border mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); exec(t.cmd, t.value) }}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-background hover:text-emerald-600 text-muted-foreground transition-colors"
              title={t.title}
            >
              <t.icon className="h-4 w-4" />
            </button>
          )
        )}
        <div className="flex-1" />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded hover:bg-background transition-colors"
          >
            Limpar
          </button>
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none p-4 outline-none min-h-[200px] overflow-y-auto",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50",
        )}
        style={{ minHeight }}
      />
    </div>
  )
}
