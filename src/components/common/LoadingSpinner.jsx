export default function LoadingSpinner({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-dark-700 border-t-primary-500 rounded-full animate-spin`} />
      {text && <p className="text-slate-500 text-sm font-body">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-body">{text || 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return spinner
}
