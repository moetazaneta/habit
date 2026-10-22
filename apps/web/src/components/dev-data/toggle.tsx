import { DEV_DATASETS, type DevDataset } from "@/components/dev-data/fixtures";

/**
 * A dev-only switch between the datasets of the fake provider (break-ui). It shows only when the
 * URL names a dataset (`?data=worst`), and a switch reloads the page with the new one.
 */
export function DevDataToggle({ current }: { current: DevDataset }) {
  return (
    <div
      role="radiogroup"
      aria-label="Dev data"
      style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top, 0px) + 6px)",
        left: 6,
        zIndex: 60,
        display: "flex",
        gap: 2,
        padding: 2,
        borderRadius: 8,
        background: "#48484a",
        font: "500 11px/16px system-ui, sans-serif",
      }}
    >
      {DEV_DATASETS.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={name === current}
          style={{
            padding: "2px 7px",
            borderRadius: 6,
            background: name === current ? "#fff" : "transparent",
            color: name === current ? "#000" : "#fff",
          }}
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set("data", name);
            window.location.assign(url);
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
