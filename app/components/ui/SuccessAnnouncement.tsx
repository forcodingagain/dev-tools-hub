interface SuccessAnnouncementProps {
  message: string
  className?: string
}

export function SuccessAnnouncement({ message, className = "" }: SuccessAnnouncementProps) {
  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-md p-4 mb-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div
          className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5"
          aria-hidden="true"
          style={{
            fontSize: '20px',
            lineHeight: '1.25'
          }}
        >
          ✅
        </div>
        <div className="text-sm text-green-800">{message}</div>
      </div>
    </div>
  )
}