"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

type CalendarProps = {
  selected: Date | null
  onChange: (date: Date | null) => void
  className?: string
  placeholderText?: string
  minDate?: Date
  maxDate?: Date
}

export function Calendar({
  selected,
  onChange,
  className,
  placeholderText = "Select date",
  minDate,
  maxDate,
}: CalendarProps) {
  return (
    <div className={cn("relative", className)}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        placeholderText={placeholderText}
        minDate={minDate}
        maxDate={maxDate}
        className={cn(
          "w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary",
          className
        )}
        calendarClassName="!bg-white p-2 rounded-md shadow-md"
        dayClassName={() =>
          cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal"
          )
        }
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex justify-between items-center mb-2 px-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 p-0 opacity-70"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {date.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-7 w-7 p-0 opacity-70"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      />
    </div>
  )
}
