'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  data: { timestamp: number; value: number }[]
  isActive?: boolean
  onClick?: () => void
  className?: string
  formatValue: (value: number) => string
  formatTime: (timestamp: number) => string
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  data, 
  isActive, 
  onClick,
  className,
  formatValue,
  formatTime
}: StatsCardProps) {
  const [showChart, setShowChart] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg min-w-[120px]">
          <div className="text-sm text-gray-600 mb-2">
            {formatTime(label)}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">今日{title}</span>
              <span className="text-sm font-medium">
                {formatValue(payload[0].value)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Card 
          className={`relative cursor-pointer transition-all duration-200 bg-white border-gray-100 hover:shadow-md ${
            isActive ? 'ring-2 ring-blue-500' : ''
          } ${className}`}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div 
              className="h-[50px] mt-2 transition-opacity duration-200"
              style={{ opacity: isHovered ? 0 : 0.5 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={1} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {isHovered && (
              <motion.div 
                className="absolute inset-0 bg-white rounded-lg shadow-lg p-4 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowChart(true)
                }}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                      <p className="text-2xl font-bold">{value}</p>
                    </div>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={data}
                        onMouseMove={(e) => {
                          if (e && e.isTooltipActive === false) {
                            const chartElement = e.currentTarget
                            if (chartElement) {
                              const mouseEvent = new MouseEvent('mousemove', {
                                clientX: e.chartX,
                                clientY: e.chartY
                              })
                              chartElement.dispatchEvent(mouseEvent)
                            }
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={formatTime}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          hide 
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                          isAnimationActive={false}
                          position={{ y: -20 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                          dot={false}
                          activeDot={{ r: 4, fill: '#8884d8' }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: '#8884d8', strokeWidth: 1 }}
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#8884d8' }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

