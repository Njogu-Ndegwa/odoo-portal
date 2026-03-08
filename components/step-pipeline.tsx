'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

export interface PipelineStep {
  label: string
  icon?: ReactNode
}

interface StepPipelineProps {
  steps: PipelineStep[]
  currentStep: number
  onStepClick?: (index: number) => void
}

export default function StepPipeline({ steps, currentStep, onStepClick }: StepPipelineProps) {
  return (
    <div className="w-full mb-6">
      {/* Desktop: full-width horizontal layout */}
      <div className="hidden sm:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isFirst = i === 0
          const isLast = i === steps.length - 1

          return (
            <button
              key={i}
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              className={`group relative flex flex-col items-center text-center ${
                onStepClick ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Connector line */}
              <div className="absolute top-[18px] left-0 right-0 h-[3px] z-0">
                {!isFirst && (
                  <div
                    className={`absolute left-0 right-1/2 h-full transition-colors ${
                      isDone || isActive
                        ? 'bg-green-400 dark:bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
                {!isLast && (
                  <div
                    className={`absolute left-1/2 right-0 h-full transition-colors ${
                      isDone
                        ? 'bg-green-400 dark:bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>

              {/* Icon circle */}
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ring-4 ${
                  isDone
                    ? 'bg-green-600 text-white ring-green-100 dark:bg-green-500 dark:ring-green-900/40'
                    : isActive
                    ? 'bg-violet-600 text-white ring-violet-100 shadow-lg shadow-violet-200/50 dark:bg-violet-500 dark:ring-violet-900/40 dark:shadow-violet-900/30'
                    : 'bg-white text-gray-400 ring-gray-100 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:ring-gray-800 dark:border-gray-700'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4" strokeWidth={3} />
                ) : step.icon ? (
                  <span className="w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
                    {step.icon}
                  </span>
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-[11px] font-semibold leading-tight transition-colors px-1 ${
                  isDone
                    ? 'text-green-700 dark:text-green-400'
                    : isActive
                    ? 'text-violet-700 dark:text-violet-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile: scrollable compact layout */}
      <div className="flex sm:hidden items-center gap-0 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const isDone = i < currentStep
          const isActive = i === currentStep
          const isLast = i === steps.length - 1

          return (
            <div key={i} className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                disabled={!onStepClick}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-[1.5px] whitespace-nowrap transition-all text-[11px] font-semibold ${
                  isDone
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30'
                    : isActive
                    ? 'border-violet-300 bg-violet-50 shadow-[0_0_0_2px_rgba(139,92,246,0.1)] dark:border-violet-600 dark:bg-violet-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isDone
                      ? 'bg-green-600 text-white dark:bg-green-500'
                      : isActive
                      ? 'bg-violet-600 text-white dark:bg-violet-500'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={
                    isDone
                      ? 'text-green-700 dark:text-green-400'
                      : isActive
                      ? 'text-violet-700 dark:text-violet-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div
                  className={`w-4 h-[2px] shrink-0 ${
                    isDone ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
