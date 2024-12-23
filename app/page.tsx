'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { VideoAdTable } from './components/VideoAdTable'
import { Navbar } from './components/Navbar'
import { StatsCard } from './components/StatsCard'
import { CreditCard, Banknote, TrendingUp, PieChart, Video, VideoOff, BarChart, Percent, Target, DollarSign } from 'lucide-react'
import { getVideoAdMaterials } from '../lib/api'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock API function
const fetchData = async (start: Date, end: Date) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const generateTimeSeriesData = (baseValue: number) => {
    const data = []
    let currentTime = start.getTime()
    while (currentTime <= end.getTime()) {
      data.push({
        timestamp: currentTime,
        value: baseValue + Math.random() * baseValue * 0.1
      })
      currentTime += 10 * 60 * 1000 // 10 minutes
    }
    return data
  }

  const videoAdMaterials = await getVideoAdMaterials()

  return {
    totalSpend: generateTimeSeriesData(100000),
    totalRevenue: generateTimeSeriesData(150000),
    totalROI: generateTimeSeriesData(1.5),
    materialConversionRate: generateTimeSeriesData(0.5),
    liveStreamRevenue: generateTimeSeriesData(50000),
    liveStreamSpend: generateTimeSeriesData(30000),
    liveStreamROI: generateTimeSeriesData(1.67),
    ctr: generateTimeSeriesData(0.05),
    conversionRate: generateTimeSeriesData(0.02),
    cpm: generateTimeSeriesData(10),
    videoAdMaterials: videoAdMaterials.map(material => ({
      ...material,
      totalSpend: Math.random() * 100000,
      totalRevenue: Math.random() * 150000,
      totalROI: Math.random() * 2 + 0.5,
      materialConversionRate: Math.random() * 0.5,
      liveStreamRevenue: Math.random() * 50000,
      liveStreamSpend: Math.random() * 30000,
      liveStreamROI: Math.random() * 2 + 0.5,
      ctr: Math.random() * 0.1,
      conversionRate: Math.random() * 0.05,
      cpm: Math.random() * 20,
    })),
  }
}

const viewFields = [
  { id: 'totalSpend', label: '全域素材消耗金额' },
  { id: 'totalRevenue', label: '全域素材成交金额' },
  { id: 'totalROI', label: '全域素材ROI' },
  { id: 'materialConversionRate', label: '素材成交占比' },
  { id: 'liveStreamRevenue', label: '直播间画面成交金额' },
  { id: 'liveStreamSpend', label: '直播间画面消耗金额' },
  { id: 'liveStreamROI', label: '直播间画面ROI' },
  { id: 'ctr', label: '点击率 (CTR)' },
  { id: 'conversionRate', label: '转化率' },
  { id: 'cpm', label: '千次展示费用 (CPM)' },
]

function ViewFieldSelector({ selectedFields, onChange }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">选择视图字段</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">选择要显示的字段</h4>
          {viewFields.map((field) => (
            <div key={field.id} className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={selectedFields.includes(field.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selectedFields, field.id])
                  } else {
                    onChange(selectedFields.filter((id) => id !== field.id))
                  }
                }}
              />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function Home() {
  const [data, setData] = useState<any>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [selectedFields, setSelectedFields] = useState(viewFields.map(field => field.id))
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const loadData = async () => {
      if (date) {
        const start = new Date(date.setHours(0, 0, 0, 0))
        const end = new Date(date.setHours(23, 59, 59, 999))
        const newData = await fetchData(start, end)
        setData(newData)
      }
    }
    loadData()
  }, [date, timeRange])

  const toggleFilter = (metric: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(metric)) {
        newFilters.delete(metric)
      } else {
        newFilters.add(metric)
      }
      return newFilters
    })
  }


  const filteredMaterials = useMemo(() => {
    if (!data || activeFilters.size === 0) return data?.videoAdMaterials

    return data.videoAdMaterials.filter((material: any) => {
      return Array.from(activeFilters).every(filter => {
        const value = material[filter]
        const average = data[filter].reduce((sum: number, item: any) => sum + item.value, 0) / data[filter].length
        return value >= average
      })
    })
  }, [data, activeFilters])

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold text-gray-800"
      >
        加载中...
      </motion.div>
    </div>
  )

  const getLatestValue = (dataArray: any[]) => {
    return dataArray[dataArray.length - 1].value
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7FF] to-white">
      <Navbar />
      <motion.main 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold mb-8 text-gray-800 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          视频广告素材数据
        </motion.h1>
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select
              value={timeRange.toString()}
              onValueChange={(value) => setTimeRange(parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择时间周期" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">近30分钟</SelectItem>
                <SelectItem value="60">近1小时</SelectItem>
                <SelectItem value="120">近2小时</SelectItem>
                <SelectItem value="180">近3小时</SelectItem>
                <SelectItem value="360">近6小时</SelectItem>
                <SelectItem value="720">近12小时</SelectItem>
              </SelectContent>
            </Select>
            <ViewFieldSelector
              selectedFields={selectedFields}
              onChange={setSelectedFields}
            />
          </div>
        </motion.div>
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <ScrollArea className="w-full">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 pb-4">
              {viewFields
                .filter(field => selectedFields.includes(field.id))
                .map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <StatsCard 
                      title={field.label}
                      value={
                        field.id === 'ctr' || field.id === 'conversionRate' || field.id === 'materialConversionRate'
                          ? `${(getLatestValue(data[field.id]) * 100).toFixed(2)}%`
                          : field.id === 'cpm' || field.id.includes('Spend') || field.id.includes('Revenue')
                          ? `¥${getLatestValue(data[field.id]).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : getLatestValue(data[field.id]).toFixed(2)
                      }
                      icon={(() => {
                        switch (field.id) {
                          case 'totalSpend': return <CreditCard className="h-6 w-6 text-blue-500" />
                          case 'totalRevenue': return <Banknote className="h-6 w-6 text-green-500" />
                          case 'totalROI': return <TrendingUp className="h-6 w-6 text-purple-500" />
                          case 'materialConversionRate': return <PieChart className="h-6 w-6 text-yellow-500" />
                          case 'liveStreamRevenue': return <Video className="h-6 w-6 text-red-500" />
                          case 'liveStreamSpend': return <VideoOff className="h-6 w-6 text-orange-500" />
                          case 'liveStreamROI': return <BarChart className="h-6 w-6 text-indigo-500" />
                          case 'ctr': return <Percent className="h-6 w-6 text-cyan-500" />
                          case 'conversionRate': return <Target className="h-6 w-6 text-emerald-500" />
                          case 'cpm': return <DollarSign className="h-6 w-6 text-pink-500" />
                          default: return null
                        }
                      })()}
                      data={data[field.id].filter(item => 
                        item.timestamp >= Date.now() - timeRange * 60 * 1000
                      )}
                      isActive={activeFilters.has(field.id)}
                      onClick={() => toggleFilter(field.id)}
                      className="h-full"
                      formatValue={(value) => 
                        field.id === 'ctr' || field.id === 'conversionRate' || field.id === 'materialConversionRate'
                          ? `${(value * 100).toFixed(2)}%`
                          : field.id === 'cpm' || field.id.includes('Spend') || field.id.includes('Revenue')
                          ? `¥${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : value.toFixed(2)
                      }
                      formatTime={(timestamp) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                  </motion.div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <VideoAdTable materials={filteredMaterials} />
        </motion.div>
      </motion.main>
    </div>
  )
}

