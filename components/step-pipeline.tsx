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
  /** Furthest step the order has actually reached. Defaults to currentStep. */
  maxStep?: number
  onStepClick?: (index: number) => void
}

export default function StepPipeline({ steps, currentStep, maxStep, onStepClick }: StepPipelineProps) {
  const effectiveMax = maxStep ?? currentStep

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, i) => {
          const isDone = i < effectiveMax
          const isActive = i === currentStep
          const isFirst = i === 0
          const isLast = i === steps.length - 1
          const isReachable = i <= effectiveMax

          return (
            <button
              key={i}
              type="button"
              onClick={() => isReachable && onStepClick?.(i)}
              disabled={!onStepClick || !isReachable}
              className={`group relative flex flex-col items-center text-center ${
                onStepClick && isReachable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Connector */}
              <div className="absolute top-[13px] left-0 right-0 z-0">
                {!isFirst && (
                  <div
                    className={`absolute left-0 right-1/2 transition-colors duration-200 ${
                      i <= effectiveMax
                        ? 'h-[2px] bg-green-400 dark:bg-green-600'
                        : 'h-px bg-gray-200 dark:bg-gray-700 border-t border-dashed border-gray-300 dark:border-gray-600'
                    }`}
                  />
                )}
                {!isLast && (
                  <div
                    className={`absolute left-1/2 right-0 transition-colors duration-200 ${
                      isDone
                        ? 'h-[2px] bg-green-400 dark:bg-green-600'
                        : 'h-px bg-gray-200 dark:bg-gray-700 border-t border-dashed border-gray-300 dark:border-gray-600'
                    }`}
                  />
                )}
              </div>

              {/* Circle */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ring-2 ${
                  isActive
                    ? 'bg-violet-600 text-white ring-violet-100 shadow-sm dark:bg-violet-500 dark:ring-violet-900/30'
                    : isDone
                    ? 'bg-green-500 text-white ring-green-100 dark:bg-green-500 dark:ring-green-900/30'
                    : i === effectiveMax
                    ? 'bg-violet-600 text-white ring-violet-100 shadow-sm dark:bg-violet-500 dark:ring-violet-900/30'
                    : 'bg-white text-gray-400 ring-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:ring-gray-800 dark:border-gray-700'
                }`}
              >
                {isDone && !isActive ? (
                  <Check className="w-3 h-3" strokeWidth={3} />
                ) : step.icon ? (
                  <span className="w-3.5 h-3.5 flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5">
                    {step.icon}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-1 text-[10px] font-medium leading-tight transition-colors duration-200 px-0.5 ${
                  isActive
                    ? 'text-violet-700 font-semibold dark:text-violet-400'
                    : isDone
                    ? 'text-green-600 dark:text-green-400'
                    : i === effectiveMax
                    ? 'text-violet-700 font-semibold dark:text-violet-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden items-center gap-0 overflow-x-auto pb-1">
        {steps.map((step, i) => {
          const isDone = i < effectiveMax
          const isActive = i === currentStep
          const isLast = i === steps.length - 1
          const isReachable = i <= effectiveMax

          return (
            <div key={i} className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => isReachable && onStepClick?.(i)}
                disabled={!onStepClick || !isReachable}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border whitespace-nowrap transition-all duration-200 text-[10px] font-medium ${
                  isActive
                    ? 'border-violet-200 bg-violet-50 dark:border-violet-700 dark:bg-violet-900/20'
                    : isDone
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    isActive
                      ? 'bg-violet-600 text-white dark:bg-violet-500'
                      : isDone
                      ? 'bg-green-500 text-white dark:bg-green-500'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                >
                  {isDone && !isActive ? <Check className="w-2.5 h-2.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={
                    isActive
                      ? 'text-violet-700 dark:text-violet-400'
                      : isDone
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }
                >
                  {step.label}
                </span>
              </button>
              {!isLast && (
                <div
                  className={`w-3 h-px shrink-0 ${
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
