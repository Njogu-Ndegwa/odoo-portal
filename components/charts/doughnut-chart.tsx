// 'use client'

// import { useRef, useState, useEffect } from 'react'
// import { useTheme } from 'next-themes'

// import { chartColors } from '@/components/charts/chartjs-config'
// import {
//   Chart, DoughnutController, ArcElement, TimeScale, Tooltip,
// } from 'chart.js'
// import type { ChartData } from 'chart.js'
// import 'chartjs-adapter-moment'

// // Import utilities
// import { getCssVariable } from '@/components/utils/utils'

// Chart.register(DoughnutController, ArcElement, TimeScale, Tooltip)
// Chart.overrides.doughnut.cutout = '80%'

// interface DoughnutProps {
//   data: ChartData
//   width: number
//   height: number
// }

// export default function DoughnutChart({
//   data,
//   width,
//   height
// }: DoughnutProps) {

//   const [chart, setChart] = useState<Chart | null>(null)
//   const canvas = useRef<HTMLCanvasElement>(null)
//   const legend = useRef<HTMLUListElement>(null)
//   const { theme } = useTheme()
//   const darkMode = theme === 'dark'
//   const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors 

//   useEffect(() => {    
//     const ctx = canvas.current
//     if (!ctx) return
    
//     const newChart = new Chart(ctx, {
//       type: 'doughnut',
//       data: data,
//       options: {
//         layout: {
//           padding: 24,
//         },
//         plugins: {
//           legend: {
//             display: false,
//           },
//           tooltip: {
//             titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
//             bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
//             backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
//             borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
//           },             
//         },
//         interaction: {
//           intersect: false,
//           mode: 'nearest',
//         },
//         animation: {
//           duration: 500,
//         },
//         maintainAspectRatio: false,
//         resizeDelay: 200,
//       },
//       plugins: [{
//         id: 'htmlLegend',
//         afterUpdate(c, args, options) {
//           const ul = legend.current
//           if (!ul) return
//           // Remove old legend items
//           while (ul.firstChild) {
//             ul.firstChild.remove()
//           }
//           // Reuse the built-in legendItems generator
//           const items = c.options.plugins?.legend?.labels?.generateLabels?.(c)
//           items?.forEach((item) => {
//             const li = document.createElement('li')
//             li.style.margin = '4px'
//             // Button element
//             const button = document.createElement('button')
//             button.classList.add('btn-xs', 'bg-white', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-400', 'shadow-sm', 'shadow-black/[0.08]', 'rounded-full')
//             button.style.opacity = item.hidden ? '.3' : ''
//             button.onclick = () => {
//               c.toggleDataVisibility(item.index!)
//               c.update()
//             }
//             // Color box
//             const box = document.createElement('span')
//             box.style.display = 'block'
//             box.style.width = '8px'
//             box.style.height = '8px'
//             box.style.backgroundColor = item.fillStyle as string
//             box.style.borderRadius = '4px'
//             box.style.marginRight = '4px'
//             box.style.pointerEvents = 'none'
//             // Label
//             const label = document.createElement('span')
//             label.style.display = 'flex'
//             label.style.alignItems = 'center'
//             const labelText = document.createTextNode(item.text)
//             label.appendChild(labelText)
//             li.appendChild(button)
//             button.appendChild(box)
//             button.appendChild(label)
//             ul.appendChild(li)
//           })
//         },
//       }],
//     })
//     setChart(newChart)
//     return () => newChart.destroy()
//   }, [])

//   useEffect(() => {
//     if (!chart) return

//     if (darkMode) {
//       chart.options.plugins!.tooltip!.titleColor = tooltipTitleColor.dark
//       chart.options.plugins!.tooltip!.bodyColor = tooltipBodyColor.dark
//       chart.options.plugins!.tooltip!.backgroundColor = tooltipBgColor.dark
//       chart.options.plugins!.tooltip!.borderColor = tooltipBorderColor.dark
//     } else {
//       chart.options.plugins!.tooltip!.titleColor = tooltipTitleColor.light
//       chart.options.plugins!.tooltip!.bodyColor = tooltipBodyColor.light
//       chart.options.plugins!.tooltip!.backgroundColor = tooltipBgColor.light
//       chart.options.plugins!.tooltip!.borderColor = tooltipBorderColor.light
//     }
//     chart.update('none')
//   }, [theme])     

//   return (
//     <div className="grow flex flex-col justify-center">
//       <div>
//         <canvas ref={canvas} width={width} height={height}></canvas>
//       </div>
//       <div className="px-5 pt-2 pb-6">
//         <ul ref={legend} className="flex flex-wrap justify-center -m-1"></ul>
//       </div>
//     </div>
//   )
// }

'use client'

import { useRef, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'

import { chartColors } from '@/components/charts/chartjs-config'
import type { ChartData } from 'chart.js'

interface DoughnutProps {
  data: ChartData
  width: number
  height: number
}

interface LegendItem {
  text: string
  fillStyle: string
  hidden: boolean
  index: number
}

// Client-only chart component
function ClientOnlyDoughnutChart({
  data,
  width,
  height
}: DoughnutProps) {
  const [chart, setChart] = useState<any>(null)
  const [legendItems, setLegendItems] = useState<LegendItem[]>([])
  const canvas = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const darkMode = theme === 'dark'
  const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors 

  useEffect(() => {
    let Chart: any
    let DoughnutController: any
    let ArcElement: any
    let TimeScale: any
    let Tooltip: any
    let Legend: any

    const initChart = async () => {
      try {
        // Dynamic import of Chart.js to avoid SSR issues
        const chartModule = await import('chart.js')
        Chart = chartModule.Chart
        DoughnutController = chartModule.DoughnutController
        ArcElement = chartModule.ArcElement
        TimeScale = chartModule.TimeScale
        Tooltip = chartModule.Tooltip
        Legend = chartModule.Legend

        // Register components
        Chart.register(DoughnutController, ArcElement, TimeScale, Tooltip, Legend)

        const ctx = canvas.current
        if (!ctx) return

        // Clear any existing chart
        if (chart) {
          chart.destroy()
        }
        
        const newChart = new Chart(ctx, {
          type: 'doughnut',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: 20,
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                enabled: true,
                titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
                bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
                backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
                borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                  label: function(context: any) {
                    const label = context.label || ''
                    const value = context.parsed
                    const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0)
                    const percentage = ((value / total) * 100).toFixed(1)
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              },             
            },
            elements: {
              arc: {
                borderWidth: 0,
                borderRadius: 4,
              }
            },
            interaction: {
              intersect: false,
              mode: 'nearest',
            },
            animation: {
              duration: 800,
              easing: 'easeOutQuart',
            },
            cutout: '75%', // This creates the doughnut hole
          },
          plugins: [{
            id: 'reactLegend',
            afterUpdate(c: any) {
              try {
                // Generate legend items and update React state
                const items = c.options.plugins?.legend?.labels?.generateLabels?.(c) || 
                              c.data.labels?.map((label: string, index: number) => ({
                                text: label,
                                fillStyle: c.data.datasets[0].backgroundColor[index],
                                hidden: false,
                                index: index
                              })) || []
                
                const legendData: LegendItem[] = items.map((item: any, index: number) => ({
                  text: item.text || `Item ${index + 1}`,
                  fillStyle: item.fillStyle || '#000',
                  hidden: item.hidden || false,
                  index: item.index !== undefined ? item.index : index
                }))
                
                setLegendItems(legendData)
              } catch (error) {
                console.error('Error updating legend:', error)
              }
            },
          }],
        })
        
        setChart(newChart)
      } catch (error) {
        console.error('Error initializing chart:', error)
      }
    }

    // Add a small delay to ensure DOM is ready
    const timeout = setTimeout(initChart, 100)

    return () => {
      clearTimeout(timeout)
      if (chart) {
        chart.destroy()
      }
    }
  }, [data]) // Add data as dependency to re-render when data changes

  useEffect(() => {
    if (!chart) return

    // Update theme colors
    const tooltipOptions = chart.options.plugins.tooltip
    if (tooltipOptions) {
      tooltipOptions.titleColor = darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light
      tooltipOptions.bodyColor = darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light
      tooltipOptions.backgroundColor = darkMode ? tooltipBgColor.dark : tooltipBgColor.light
      tooltipOptions.borderColor = darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light
      chart.update('none')
    }
  }, [theme, chart, darkMode, tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor])

  const handleLegendClick = (index: number) => {
    if (!chart) return
    
    try {
      // Toggle data visibility
      const meta = chart.getDatasetMeta(0)
      const arc = meta.data[index]
      
      if (arc) {
        arc.hidden = !arc.hidden
        chart.update()
        
        // Update legend items state
        setLegendItems(prev => prev.map(item => 
          item.index === index ? { ...item, hidden: arc.hidden } : item
        ))
      }
    } catch (error) {
      console.error('Error toggling legend:', error)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        <canvas 
          ref={canvas} 
          width={width} 
          height={height}
          className="max-w-full max-h-full"
        />
      </div>
      
      {/* Custom Legend */}
      {legendItems.length > 0 && (
        <div className="mt-4 w-full">
          <ul className="flex flex-wrap justify-center gap-2">
            {legendItems.map((item) => (
              <li key={item.index}>
                <button
                  className={`
                    inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full
                    bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
                    border border-gray-200 dark:border-gray-600
                    hover:bg-gray-50 dark:hover:bg-gray-600
                    transition-all duration-200
                    ${item.hidden ? 'opacity-50' : 'opacity-100'}
                  `}
                  onClick={() => handleLegendClick(item.index)}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fillStyle }}
                  />
                  <span className="whitespace-nowrap">{item.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Loading placeholder component
function ChartPlaceholder({ width, height }: { width: number; height: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width, height }}>
        <div 
          className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full border-8 border-gray-100 dark:border-gray-800" 
          style={{ width: width * 0.8, height: height * 0.8 }}
        />
      </div>
      <div className="mt-4 w-full">
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main component with dynamic import
const DoughnutChart = dynamic(
  () => Promise.resolve(ClientOnlyDoughnutChart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder width={192} height={192} />
  }
)

export default DoughnutChart