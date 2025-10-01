"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

export function PortfolioChart() {
  const [timeframe, setTimeframe] = useState<"1D" | "7D" | "1M">("7D")

  // Mock chart data
  const chartData = {
    "1D": [
      { time: "00:00", value: 50000 },
      { time: "04:00", value: 51200 },
      { time: "08:00", value: 49800 },
      { time: "12:00", value: 52100 },
      { time: "16:00", value: 53400 },
      { time: "20:00", value: 52800 },
      { time: "24:00", value: 54200 },
    ],
    "7D": [
      { time: "Mon", value: 48000 },
      { time: "Tue", value: 49500 },
      { time: "Wed", value: 51200 },
      { time: "Thu", value: 50800 },
      { time: "Fri", value: 52400 },
      { time: "Sat", value: 53100 },
      { time: "Sun", value: 54200 },
    ],
    "1M": [
      { time: "Week 1", value: 45000 },
      { time: "Week 2", value: 47500 },
      { time: "Week 3", value: 49200 },
      { time: "Week 4", value: 54200 },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Portfolio Performance</CardTitle>
          <div className="flex gap-1">
            {(["1D", "7D", "1M"] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(period)}
                className="text-xs"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData[timeframe]}>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
