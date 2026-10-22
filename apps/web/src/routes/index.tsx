import type { HabitColor, HabitIcon as HabitIconValue } from "@habit/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DaySquare } from "@/components/day-square";
import { HabitIcon } from "@/components/habit-icon";
import { habitColorStyle } from "@/components/palette";
import { ResponsiveSheet } from "@/components/sheet";
import { toastSaveError, toastUndo } from "@/components/toast";

export const Route = createFileRoute("/")({
  component: Home,
});

// A preview of the design foundation with the rows of the sketch, until the list replaces it.
const rows: { name: string; color: HabitColor; icon: HabitIconValue; days: number[] }[] = [
  {
    name: "Water",
    color: "blue",
    icon: { type: "phosphor", name: "drop" },
    days: [1, 0.75, 1, 0.38, 0.62],
  },
  {
    name: "Read",
    color: "ochre",
    icon: { type: "phosphor", name: "book-open" },
    days: [1, 0, 1, 0.67, 0.33],
  },
  {
    name: "Meditate",
    color: "green",
    icon: { type: "phosphor", name: "flower-lotus" },
    days: [1, 1, 0, 1, 1],
  },
  {
    name: "Gym",
    color: "rose",
    icon: { type: "phosphor", name: "barbell" },
    days: [1, 0, 1, 0, 1],
  },
  {
    name: "Mood",
    color: "violet",
    icon: { type: "phosphor", name: "smiley" },
    days: [0.75, 0.5, 1, 0.25, 0.75],
  },
  {
    name: "Sleep",
    color: "teal",
    icon: { type: "phosphor", name: "moon-stars" },
    days: [0.94, 0.75, 1, 1, 0.88],
  },
  {
    name: "Smoking",
    color: "slate",
    icon: { type: "phosphor", name: "cigarette" },
    days: [0.6, 1, 0.4, 0, 0.2],
  },
  {
    name: "Coffee",
    color: "sand",
    icon: { type: "phosphor", name: "coffee" },
    days: [1, 1, 1, 0.5, 1],
  },
  {
    name: "Journal",
    color: "mauve",
    icon: { type: "phosphor", name: "notebook" },
    days: [1, 0, 1, 1, 0],
  },
  {
    name: "Spanish",
    color: "olive",
    icon: { type: "phosphor", name: "translate" },
    days: [1, 1, 1, 0, 0.7],
  },
  {
    name: "Vitamins",
    color: "apricot",
    icon: { type: "phosphor", name: "pill" },
    days: [1, 0, 1, 1, 0],
  },
];

function Home() {
  const [days, setDays] = useState(() => rows.map((row) => row.days));
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <main className="mx-auto max-w-[600px] pt-[env(safe-area-inset-top)]">
      <h1 className="sr-only">Habit</h1>
      <div className="h-6" />
      {rows.map((row, r) => (
        <div
          key={row.name}
          className="flex h-(--row) items-center px-(--gutter)"
          style={habitColorStyle(row.color)}
        >
          <HabitIcon icon={row.icon} color={row.color} />
          <span className="ml-3 flex-1 truncate text-[1.0625rem] font-semibold text-ink-2">
            {row.name}
          </span>
          <div className="flex gap-(--square-gap)">
            {days[r]!.map((value, d) => (
              <button
                key={d}
                type="button"
                aria-label={`${row.name}, day ${d + 1}`}
                onClick={() =>
                  setDays((all) =>
                    all.map((rowDays, i) =>
                      i === r
                        ? rowDays.map((v, j) =>
                            j === d ? (v >= 1 ? 0 : Math.min(1, v + 0.25)) : v,
                          )
                        : rowDays,
                    ),
                  )
                }
              >
                <DaySquare color={row.color} intensity={value} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-3 px-(--gutter) py-6">
        <button
          type="button"
          className="text-ink-3"
          onClick={() => toastUndo("Painted 3 days", () => {})}
        >
          Undo toast
        </button>
        <button type="button" className="text-ink-3" onClick={() => toastSaveError(() => {})}>
          Error toast
        </button>
        <button type="button" className="text-ink-3" onClick={() => setSheetOpen(true)}>
          Sheet
        </button>
      </div>
      <ResponsiveSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Water · Thu 22">
        <p className="text-ink-3">The content of a sheet.</p>
      </ResponsiveSheet>
    </main>
  );
}
