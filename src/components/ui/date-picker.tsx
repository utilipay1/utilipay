"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X, Target } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = "Pick a date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = (selectedDate?: Date) => {
    setDate(selectedDate)
    if (selectedDate) {
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDate(undefined)
    setIsOpen(false)
  }

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    const today = new Date()
    setDate(today)
    setIsOpen(false)
  }

  return (
    <div className="relative group w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-medium transition-all duration-200 rounded-xl px-4 py-6 border-input/50 hover:border-primary hover:bg-muted/30 cursor-pointer",
              !date && "text-muted-foreground",
              isOpen && "border-primary ring-2 ring-primary/10 bg-muted/20"
            )}
          >
            <CalendarIcon className={cn(
              "mr-2 h-4 w-4 transition-colors duration-200",
              isOpen ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="flex-1">
              {date ? format(date, "PPP") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" align="start">
          <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Select Date
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToday}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter gap-1.5 hover:bg-primary/5 hover:text-primary cursor-pointer"
            >
              <Target className="h-3 w-3" />
              Today
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2050}
            className="p-4"
          />
        </PopoverContent>
      </Popover>

      {date && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            title="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
