// src/app/dashboard/RestDayCard.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed } from "lucide-react"; // A nice icon for rest

type RestDayCardProps = {
  dayInfo: {
    DayFocus: string;
    notes: string[];
  };
};

export default function RestDayCard({ dayInfo }: RestDayCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bed className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Rest & Recovery</CardTitle>
            <p className="text-muted-foreground">{dayInfo.DayFocus}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-semibold">Today&apos;s Focus:</p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          {dayInfo.notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}