import React from "react"

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center w-full h-full bg-black">
          <div className="text-center p-8">
            <p className="text-white/70 text-sm mb-4">Erro na chamada de vídeo</p>
            <p className="text-white/50 text-xs mb-4">Tente recarregar a página.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}