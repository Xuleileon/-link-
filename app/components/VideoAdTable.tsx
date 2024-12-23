'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { motion } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnResizeMode,
  VisibilityState,
} from "@tanstack/react-table"
import { VideoAdMaterial } from '../../types/videoAdMaterial'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Settings, Play, Maximize, X, GripVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { TimeRangeSelect } from './TimeRangeSelect'
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const resizableTableStyle = `
  .resizer {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 5px;
    background: rgba(0, 0, 0, 0.5);
    cursor: col-resize;
    user-select: none;
    touch-action: none;
  }

  .resizer.isResizing {
    background: blue;
    opacity: 1;
  }

  @media (hover: hover) {
    .resizer {
      opacity: 0;
    }

    *:hover > .resizer {
      opacity: 1;
    }
  }

  .compact-table th,
  .compact-table td {
    padding: 0.5rem;
  }
`

interface VideoAdTableProps {
  materials: VideoAdMaterial[]
}

const VideoPreview: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPlayPending, setIsPlayPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const play = useCallback(async () => {
    if (videoRef.current && !isPlaying && !isPlayPending) {
      setIsPlayPending(true)
      setError(null)
      try {
        await videoRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error playing video: ${error.message}`)
        } else {
          setError('An unknown error occurred while playing the video')
        }
        console.error('Error playing video:', error)
      } finally {
        setIsPlayPending(false)
      }
    }
  }, [isPlaying, isPlayPending])

  const pause = useCallback(() => {
    if (videoRef.current && (isPlaying || isPlayPending)) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
      setIsPlayPending(false)
    }
  }, [isPlaying, isPlayPending])

  const debouncedPlay = useDebouncedCallback(play, 100)
  const debouncedPause = useDebouncedCallback(pause, 100)

  return (
    <div 
      className="relative" 
      onMouseEnter={debouncedPlay} 
      onMouseLeave={debouncedPause}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-20 h-12 object-cover"
        muted
        loop
      />
      {!isPlaying && !isPlayPending && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Play className="w-6 h-6 text-white" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-xs p-1">
          Error loading video
        </div>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <button className="absolute bottom-1 right-1 bg-black bg-opacity-50 p-1 rounded">
            <Maximize className="w-3 h-3 text-white" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="sr-only">视频预览</DialogTitle>
          <video src={videoUrl} controls className="w-full" />
        </DialogContent>
      </Dialog>
    </div>
  )
}

const CurveChart: React.FC<{ 
  data: [number, number][], 
  color: string, 
  timeRange: number 
}> = ({ data, color, timeRange }) => {
  const now = Date.now()
  const filteredData = useMemo(() => {
    return data.filter(([timestamp]) => timestamp >= now - timeRange * 60 * 1000)
  }, [data, timeRange, now])

  const chartData = useMemo(() => {
    return filteredData.map(([timestamp, value]) => ({ timestamp, value }))
  }, [filteredData])

  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={chartData}>
        <XAxis 
          dataKey="timestamp" 
          type="number" 
          domain={['dataMin', 'dataMax']} 
          tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis hide />
        <Tooltip
          labelFormatter={(label) => `时间: ${new Date(label).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
          formatter={(value) => [`${value}`, '']}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          dot={false} 
          strokeWidth={2} 
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const formatNumber = (value: number | undefined | null, decimalPlaces: number = 0) => {
  if (value === undefined || value === null) return '-';
  return value.toLocaleString('zh-CN', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
}

const formatCurrency = (value: number | undefined | null) => 
  value === undefined || value === null ? '-' : `¥${formatNumber(value, 2)}`;

const formatPercentage = (value: number | undefined | null) => 
  value === undefined || value === null ? '-' : `${formatNumber(value * 100, 2)}%`;

const columns: ColumnDef<VideoAdMaterial>[] = [
  {
    id: "preview",
    header: "预览",
    cell: ({ row }) => <VideoPreview videoUrl={row.original.videoUrl} />,
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const material = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-6 w-6 p-0">
              <span className="sr-only">打开菜单</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(material.id)}>
              复制广告 ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>查看详情</DropdownMenuItem>
            <DropdownMenuItem>编辑广告</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 50,
  },
  {
    accessorKey: "name",
    header: "素材名称",
    cell: ({ row }) => <div className="truncate">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "recentConsumption",
    header: ({ table }) => `近${(table.options.meta as any).timeRange}分钟消耗`,
    cell: ({ row, table }) => {
      const minutes = (table.options.meta as any).timeRange
      const now = Date.now()
      const startTime = now - minutes * 60 * 1000
      
      const recentData = row.original.consumptionCurve.filter(
        ([timestamp]) => timestamp >= startTime && timestamp <= now
      )
      
      if (recentData.length === 0) return '-'
      
      const totalConsumption = recentData.reduce((sum, [_, value]) => sum + value, 0)
      return formatCurrency(totalConsumption)
    },
    enableSorting: true,
  },
  {
    accessorKey: "recentROI",
    header: ({ table }) => `近${(table.options.meta as any).timeRange}分钟ROI`,
    cell: ({ row, table }) => {
      const minutes = (table.options.meta as any).timeRange
      const now = Date.now()
      const startTime = now - minutes * 60 * 1000
      
      const recentData = row.original.roiCurve.filter(
        ([timestamp]) => timestamp >= startTime && timestamp <= now
      )
      
      if (recentData.length === 0) return '-'
      
      const averageROI = recentData.reduce((sum, [_, value]) => sum + value, 0) / recentData.length
      return formatNumber(averageROI, 2)
    },
    enableSorting: true,
  },
  {
    accessorKey: "consumptionCurve",
    header: "消耗曲线",
    cell: ({ row, table }) => (
      <CurveChart 
        data={row.original.consumptionCurve} 
        color="#3b82f6" 
        timeRange={(table.options.meta as any).timeRange}
      />
    ),
    size: 250,
  },
  {
    accessorKey: "roiCurve",
    header: "ROI曲线",
    cell: ({ row, table }) => (
      <CurveChart 
        data={row.original.roiCurve} 
        color="#10b981" 
        timeRange={(table.options.meta as any).timeRange}
      />
    ),
    size: 250,
  },
  {
    accessorKey: "impressions",
    header: "整体展现次数",
    cell: ({ row }) => formatNumber(row.getValue("impressions")),
    enableSorting: true,
  },
  {
    accessorKey: "clicks",
    header: "整体点击次数",
    cell: ({ row }) => formatNumber(row.getValue("clicks")),
    enableSorting: true,
  },
  {
    accessorKey: "ctr",
    header: "整体点击率",
    cell: ({ row }) => formatPercentage(row.getValue("ctr")),
    enableSorting: true,
  },
  {
    accessorKey: "conversionRate",
    header: "整体转化率",
    cell: ({ row }) => formatPercentage(row.getValue("conversionRate")),
    enableSorting: true,
  },
  {
    accessorKey: "orders",
    header: "整体成交订单数",
    cell: ({ row }) => formatNumber(row.getValue("orders")),
    enableSorting: true,
  },
  {
    accessorKey: "revenue",
    header: "整体成交金额",
    cell: ({ row }) => formatCurrency(row.getValue("revenue")),
    enableSorting: true,
  },
  {
    accessorKey: "spend",
    header: "整体消耗",
    cell: ({ row }) => formatCurrency(row.getValue("spend")),
    enableSorting: true,
  },
  {
    accessorKey: "spendRatio",
    header: "整体消耗占比",
    cell: ({ row }) => formatPercentage(row.getValue("spendRatio")),
    enableSorting: true,
  },
  {
    accessorKey: "baseSpend",
    header: "基础消耗",
    cell: ({ row }) => formatCurrency(row.getValue("baseSpend")),
    enableSorting: true,
  },
  {
    accessorKey: "orderCost",
    header: "整体成交订单成本",
    cell: ({ row }) => formatCurrency(row.getValue("orderCost")),
    enableSorting: true,
  },
  {
    accessorKey: "roi",
    header: "整体支付ROI",
    cell: ({ row }) => formatNumber(row.getValue("roi"), 2),
    enableSorting: true,
  },
  {
    accessorKey: "revenueRatio",
    header: "整体成交金额占比",
    cell: ({ row }) => formatPercentage(row.getValue("revenueRatio")),
    enableSorting: true,
  },
  {
    accessorKey: "presaleAmount",
    header: "整体预售订单金额",
    cell: ({ row }) => formatCurrency(row.getValue("presaleAmount")),
    enableSorting: true,
  },
  {
    accessorKey: "presaleOrders",
    header: "整体预售订单数",
    cell: ({ row }) => formatNumber(row.getValue("presaleOrders")),
    enableSorting: true,
  },
  {
    accessorKey: "estimatedPresaleAmount",
    header: "整体未完结预售订单预估金额",
    cell: ({ row }) => formatCurrency(row.getValue("estimatedPresaleAmount")),
    enableSorting: true,
  },
  {
    accessorKey: "couponAmount",
    header: "整体成交智能优惠券金额",
    cell: ({ row }) => formatCurrency(row.getValue("couponAmount")),
    enableSorting: true,
  },
  {
    accessorKey: "toolEffectiveness",
    header: "工具效果",
    cell: ({ row }) => row.getValue("toolEffectiveness") ?? '-',
  },
  {
    accessorKey: "reinvestmentSpend",
    header: "追投消耗",
    cell: ({ row }) => formatCurrency(row.getValue("reinvestmentSpend")),
    enableSorting: true,
  },
  {
    accessorKey: "reinvestmentOrders",
    header: "追投成交订单数",
    cell: ({ row }) => formatNumber(row.getValue("reinvestmentOrders")),
    enableSorting: true,
  },
  {
    accessorKey: "reinvestmentRevenue",
    header: "追投成交金额",
    cell: ({ row }) => formatCurrency(row.getValue("reinvestmentRevenue")),
    enableSorting: true,
  },
  {
    accessorKey: "reinvestmentROI",
    header: "追投ROI",
    cell: ({ row }) => formatNumber(row.getValue("reinvestmentROI"), 2),
    enableSorting: true,
  },
]

const ColumnSelector = ({ 
  table,
  onClose,
}: { 
  table: any;
  onClose: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  
  const allColumns = table.getAllColumns()
    .filter(column => column.id !== 'actions' && column.id !== 'preview')
    .map(column => ({
      id: column.id,
      title: typeof column.columnDef.header === 'string' 
        ? column.columnDef.header 
        : column.id,
      isVisible: column.getIsVisible()
    }))

  const selectedColumns = allColumns.filter(col => col.isVisible)

  const filteredColumns = allColumns.filter(column =>
    column.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    
    const items = Array.from(selectedColumns)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    const newOrder = items.map(item => item.id)
    const finalOrder = ['preview', 'actions', ...newOrder]
    
    table.setColumnOrder(finalOrder)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[600px]">
      <DialogHeader className="pb-4 border-b">
        <DialogTitle className="text-lg font-medium">自定义列</DialogTitle>
      </DialogHeader>
      
      <div className="flex-1 flex gap-6 overflow-hidden py-4">
        {/* Left Panel - Available Columns */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="请搜索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-1">
              {filteredColumns.map(column => (
                <label
                  key={column.id}
                  className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={column.isVisible}
                    onChange={(e) => {
                      const col = table.getColumn(column.id)
                      if (col) col.toggleVisibility(e.target.checked)
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{column.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Selected Columns */}
        <div className="w-72 border-l pl-6 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              已添加 ({selectedColumns.length})
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.getAllColumns().forEach(column => {
                  if (column.id !== 'preview' && column.id !== 'actions') {
                    column.toggleVisibility(false)
                  }
                })
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              重置
            </Button>
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="selected-columns">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="flex-1 overflow-y-auto space-y-1 pr-4"
                >
                  {selectedColumns.map((column, index) => (
                    <Draggable 
                      key={column.id} 
                      draggableId={column.id} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center justify-between px-2 py-1.5 bg-gray-50 rounded group"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm truncate">{column.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const col = table.getColumn(column.id)
                              if (col) col.toggleVisibility(false)
                            }}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button onClick={onClose}>
          确定
        </Button>
      </div>
    </div>
  )
}

const AdditionalFilters = ({ onFilterChange }) => {
  const [spendFilter, setSpendFilter] = useState('')
  const [roiFilter, setRoiFilter] = useState('')
  const [recentSpendFilter, setRecentSpendFilter] = useState('')
  const [recentRoiFilter, setRecentRoiFilter] = useState('')

  useEffect(() => {
    onFilterChange({ spendFilter, roiFilter, recentSpendFilter, recentRoiFilter })
  }, [spendFilter, roiFilter, recentSpendFilter, recentRoiFilter, onFilterChange])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">高级筛选</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spendFilter">消耗金额 ≥</Label>
            <Input
              id="spendFilter"
              value={spendFilter}
              onChange={(e) => setSpendFilter(e.target.value)}
              placeholder="最小消耗金额"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roiFilter">ROI ≥</Label>
            <Input
              id="roiFilter"
              value={roiFilter}
              onChange={(e) => setRoiFilter(e.target.value)}
              placeholder="最小ROI"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recentSpendFilter">近X分钟消耗金额 ≥</Label>
            <Input
              id="recentSpendFilter"
              value={recentSpendFilter}
              onChange={(e) => setRecentSpendFilter(e.target.value)}
              placeholder="最小近期消耗金额"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recentRoiFilter">近X分钟ROI ≥</Label>
            <Input
              id="recentRoiFilter"
              value={recentRoiFilter}
              onChange={(e) => setRecentRoiFilter(e.target.value)}
              placeholder="最小近期ROI"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function VideoAdTable({ materials }: VideoAdTableProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'preview',
    'actions',
    'name',
    'recentConsumption',
    'recentROI',
    'consumptionCurve',
    'roiCurve',
    'impressions',
    'clicks',
    'ctr',
    'conversionRate',
    'orders',
    'revenue',
    'spend',
    'spendRatio',
    'baseSpend',
    'orderCost',
    'roi',
    'revenueRatio',
    'presaleAmount',
    'presaleOrders',
    'estimatedPresaleAmount',
    'couponAmount',
    'toolEffectiveness',
    'reinvestmentSpend',
    'reinvestmentOrders',
    'reinvestmentRevenue',
    'reinvestmentROI',
  ])
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange')
  const [timeRange, setTimeRange] = useState(30)
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false)
  const [additionalFilters, setAdditionalFilters] = useState({
    spendFilter: '',
    roiFilter: '',
    recentSpendFilter: '',
    recentRoiFilter: '',
  })
  
  useEffect(() => {
    try {
      setIsLoading(true)
      if (materials) {
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载数据时出错')
      setIsLoading(false)
    }
  }, [materials])
  
  const table = useReactTable({
    data: materials.filter(material => {
      return (
        (additionalFilters.spendFilter === '' || material.spend >= parseFloat(additionalFilters.spendFilter)) &&
        (additionalFilters.roiFilter === '' || material.roi >= parseFloat(additionalFilters.roiFilter)) &&
        (additionalFilters.recentSpendFilter === '' || material.recentConsumption >= parseFloat(additionalFilters.recentSpendFilter)) &&
        (additionalFilters.recentRoiFilter === '' || material.recentROI >= parseFloat(additionalFilters.recentRoiFilter))
      )
    }),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      columnOrder,
    },
    columnResizeMode,
    enableColumnResizing: true,
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
    },
    meta: {
      timeRange,
    },
  })

  const onDragEnd = (result: any) => {
    if (!result.destination) return
    const newColumnOrder = Array.from(columnOrder)
    const [reorderedItem] = newColumnOrder.splice(result.source.index, 1)
    newColumnOrder.splice(result.destination.index, 0, reorderedItem)
    const finalOrder = [
      'preview', 
      'actions', 
      'name',
      'recentConsumption',
      'recentROI',
      'consumptionCurve',
      'roiCurve',
      ...newColumnOrder.filter(id => !['preview', 'actions', 'name', 'recentConsumption', 'recentROI', 'consumptionCurve', 'roiCurve'].includes(id))
    ];
    setColumnOrder(finalOrder)
    table.setColumnOrder(finalOrder)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-b from-[#F5F7FF] to-white min-h-screen"
    >
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64 text-red-500">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          <style>{resizableTableStyle}</style>
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex justify-between items-center">
              <Input
                placeholder="按名称筛选..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="max-w-sm bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex items-center space-x-2">
                <AdditionalFilters onFilterChange={setAdditionalFilters} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto bg-white hover:bg-blue-50 text-gray-700">
                      筛选选项 <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>时间范围</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[
                      { value: "30", label: "近30分钟" },
                      { value: "60", label: "近1小时" },
                      { value: "120", label: "近2小时" },
                      { value: "180", label: "近3小时" },
                      { value: "360", label: "近6小时" },
                      { value: "720", label: "近12小时" },
                    ].map((item) => (
                      <DropdownMenuCheckboxItem
                        key={item.value}
                        checked={timeRange === parseInt(item.value)}
                        onCheckedChange={() => {
                          const newTimeRange = parseInt(item.value);
                          setTimeRange(newTimeRange);
                          table.setOptions((prev) => ({
                            ...prev,
                            meta: { ...prev.meta, timeRange: newTimeRange },
                          }));
                        }}
                      >
                        {item.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>显示字段</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsColumnSelectorOpen(true)}>
                      自定义列 <Settings className="ml-2 h-4 w-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog open={isColumnSelectorOpen} onOpenChange={setIsColumnSelectorOpen}>
                  <DialogContent className="max-w-5xl">
                    <ColumnSelector table={table} onClose={() => setIsColumnSelectorOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <Table className="bg-white text-sm w-full relative compact-table">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-[#F8F8F8]">
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          style={{ 
                            width: header.getSize(),
                          }}
                          className="whitespace-nowrap"
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center justify-between">
                              <span className="mr-2">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                              {header.column.getCanSort() && (
                                <Button
                                  variant="ghost"
                                  onClick={() => header.column.toggleSorting()}
                                  className="p-0 h-4 w-4 hover:bg-transparent"
                                >
                                  <ArrowUpDown className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`resizer ${
                              header.column.getIsResizing() ? 'isResizing' : ''
                            }`}
                          />
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "hover:bg-gray-50",
                          index % 2 === 0 ? "bg-white" : "bg-[#F5F7FF]"
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell 
                            key={cell.id} 
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        没有找到结果。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                共 {table.getFilteredRowModel().rows.length} 条记录
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center">
                  <div className="h-8 w-8 flex items-center justify-center bg-blue-600 text-white rounded">
                    {table.getState().pagination.pageIndex + 1}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue>{table.getState().pagination.pageSize}条/页</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}条/页
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}

