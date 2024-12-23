'use client'

import { useState } from 'react'
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

interface TimeFilterProps {
  onFilterChange: (start: Date, end: Date) => void
}

export function TimeFilter({ onFilterChange }: TimeFilterProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleQuickFilter = (hours: number) => {
    const end = new Date()
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000)
    onFilterChange(start, end)
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      const start = new Date(newDate.setHours(0, 0, 0, 0))
      const end = new Date(newDate.setHours(23, 59, 59, 999))
      onFilterChange(start, end)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => handleQuickFilter(1)}>近1h</Button>
      <Button onClick={() => handleQuickFilter(24)}>当天</Button>
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
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

