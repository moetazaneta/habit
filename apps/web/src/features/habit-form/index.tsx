import type { HabitId } from "@habit/core";
import { useHabit, useHabits } from "@habit/data";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { useCloseSheet, useSheetSearch } from "@/components/sheet-search";
import { useRetained } from "@/components/use-retained";

// The sheets load on their own, after the first screen, so it does not wait for the form. The app
// loads them when it is idle, so a tap on "New habit" finds them ready. No React.lazy: its
// Suspense boundary would hold the reveal for up to 300ms even when the chunk is there.
type Sheets = typeof import("./sheets");
let sheets: Sheets | undefined;
let loading: Promise<Sheets> | undefined;

function loadSheets(): Promise<Sheets> {
  loading ??= import("./sheets").then((loaded) => (sheets = loaded));
  return loading;
}

function usePreloadSheets() {
  useEffect(() => {
    if (sheets !== undefined) return;
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(() => void loadSheets(), { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(() => void loadSheets(), 1500);
    return () => window.clearTimeout(timer);
  }, []);
}

/** The loaded sheets, or undefined while they load (then the sheet opens a moment later). */
function useSheets(): Sheets | undefined {
  const [loaded, setLoaded] = useState(sheets);
  useEffect(() => {
    if (loaded === undefined) void loadSheets().then(setLoaded);
  }, [loaded]);
  return loaded;
}

/**
 * The create and edit sheet (`?new=true`, `?edit=<habitId>`): a bottom sheet on a phone, a
 * centered dialog on a desktop. The URL owns it, so the back gesture and Escape close it. While it
 * animates out, it keeps showing what it showed.
 */
export function HabitFormSheet() {
  usePreloadSheets();
  const search = useSheetSearch();
  const current =
    search.edit !== undefined ? `edit:${search.edit}` : search.new === true ? "new" : undefined;
  const shown = useRetained(current);
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(current !== undefined);
  const open = current !== undefined;
  // A sheet that opens again starts from a fresh form, also while the last one still animates out.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((count) => count + 1);
  }
  // The session whose close animation has finished: then nothing stays mounted.
  const [exited, setExited] = useState(-1);
  if (shown === undefined || (!open && exited === session)) return null;
  // The data hooks run only below a sheet param: the app's other screens and tests may render the
  // root route without a data provider.
  return (
    <SheetHost
      key={`${shown}#${session}`}
      sheet={shown}
      open={open && current === shown}
      onExitComplete={() => setExited(session)}
    />
  );
}

function SheetHost({
  sheet,
  open,
  onExitComplete,
}: {
  sheet: string;
  open: boolean;
  onExitComplete: () => void;
}) {
  const closeSheet = useCloseSheet();
  const loaded = useSheets();
  if (loaded === undefined) return null;
  if (sheet === "new") {
    return (
      <loaded.CreateHabitSheet open={open} onClose={closeSheet} onExitComplete={onExitComplete} />
    );
  }
  return (
    <EditHost
      id={sheet.slice("edit:".length) as HabitId}
      open={open}
      onExitComplete={onExitComplete}
      EditHabitSheet={loaded.EditHabitSheet}
    />
  );
}

function EditHost({
  id,
  open,
  onExitComplete,
  EditHabitSheet,
}: {
  id: HabitId;
  open: boolean;
  onExitComplete: () => void;
  EditHabitSheet: Sheets["EditHabitSheet"];
}) {
  const habit = useHabit(id);
  const { source } = useHabits();
  const closeSheet = useCloseSheet();
  const leave = useLeaveAfterDelete(id);
  const deletedHere = useRef(false);
  // A habit that this sheet deleted stays on screen while the sheet animates out.
  const missing = habit === undefined || (habit.deletedAt !== undefined && !deletedHere.current);

  // `?edit=` with an id that the live data does not have (a stale link, a habit deleted
  // elsewhere): drop the param instead of showing an empty sheet.
  useEffect(() => {
    if (open && missing && source === "live") closeSheet();
  }, [open, missing, source, closeSheet]);

  if (habit === undefined || missing) return null;
  return (
    <EditHabitSheet
      habit={habit}
      open={open}
      onClose={closeSheet}
      onExitComplete={onExitComplete}
      onDeleted={() => {
        deletedHere.current = true;
        leave();
      }}
    />
  );
}

/**
 * After a delete: close the sheet, and when the page of the deleted habit is open under it, go to
 * the list instead, so the person does not land on a habit that is gone.
 */
function useLeaveAfterDelete(id: HabitId): () => void {
  const router = useRouter();
  const navigate = useNavigate();
  const closeSheet = useCloseSheet();
  return useCallback(() => {
    const location = router.state.location;
    if (location.pathname !== `/habits/${id}`) {
      closeSheet();
      return;
    }
    const toList = () => void navigate({ to: "/", search: {}, replace: true });
    if (location.state.sheet !== true) {
      toList();
      return;
    }
    // The app opened the sheet: go back past its history entry first, then replace the habit's
    // page with the list.
    const unsubscribe = router.history.subscribe(() => {
      unsubscribe();
      toList();
    });
    router.history.back();
  }, [router, navigate, closeSheet, id]);
}
