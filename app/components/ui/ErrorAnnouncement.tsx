interface ErrorAnnouncementProps {
  message: string
  className?: string
}

export function ErrorAnnouncement({ message, className = "" }: ErrorAnnouncementProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-4 mb-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div
          className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
          aria-hidden="true"
          style={{
            fontSize: '20px',
            lineHeight: '1.25'
          }}
        >
          ⚠️
        </div>
        <div className="text-sm text-red-800">{message}</div>
      </div>
    </div>
  )
}