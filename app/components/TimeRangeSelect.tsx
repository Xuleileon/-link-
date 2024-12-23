'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimeRangeSelectProps {
  value: number
  onChange: (minutes: number) => void
}

export function TimeRangeSelect({ value, onChange }: TimeRangeSelectProps) {
  const [customMinutes, setCustomMinutes] = useState<string>("")
  const [isCustomOpen, setIsCustomOpen] = useState(false)

  const handleCustomSubmit = () => {
    const minutes = parseInt(customMinutes)
    if (!isNaN(minutes) && minutes > 0) {
      onChange(minutes)
      setIsCustomOpen(false)
    }
  }

  const getDisplayValue = () => {
    switch (value) {
      case 30:
        return "近30分钟"
      case 60:
        return "近1小时"
      case 120:
        return "近2小时"
      default:
        return `近${value}分钟`
    }
  }

  return (
    <Select
      value={value.toString()}
      onValueChange={(val) => {
        if (val === "custom") {
          setIsCustomOpen(true)
        } else {
          onChange(parseInt(val))
        }
      }}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder={getDisplayValue()} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="30">近30分钟</SelectItem>
        <SelectItem value="60">近1小时</SelectItem>
        <SelectItem value="120">近2小时</SelectItem>
        <SelectItem value="custom">
          <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
            <PopoverTrigger asChild>
              <div className="w-full text-left">自定义</div>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">自定义时间范围</h4>
                  <p className="text-sm text-muted-foreground">
                    请输入要查看的时间范围（分钟）
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="分钟"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    type="number"
                    min="1"
                  />
                  <Button onClick={handleCustomSubmit}>确定</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

