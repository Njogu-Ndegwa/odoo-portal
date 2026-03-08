'use client'

export interface TimelineEvent {
  title: string
  meta: string
  description?: string
  color: 'green' | 'blue' | 'orange' | 'purple' | 'gray'
}

interface ActivityTimelineProps {
  events: TimelineEvent[]
}

const dotColorMap: Record<TimelineEvent['color'], string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  orange: 'bg-amber-500',
  purple: 'bg-violet-500',
  gray: 'bg-gray-400 dark:bg-gray-500',
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const isLast = i === events.length - 1

        return (
          <div key={i} className="flex gap-3.5">
            {/* Dot + line column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 mt-[5px] ${dotColorMap[event.color]}`}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {event.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {event.meta}
              </div>
              {event.description && (
                <div className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  {event.description}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
