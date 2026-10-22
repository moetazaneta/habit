/**
 * A short haptic tick where the browser can give one: `navigator.vibrate` on Android, and on iOS
 * (Safari 18 and later, which has no vibrate) the tick that a native switch control makes when it
 * toggles. Call it from a user gesture; elsewhere it does nothing.
 */
export function haptic(kind: "tap" | "lift" = "tap"): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(kind === "lift" ? 14 : 8);
    return;
  }
  iosSwitch()?.click();
}

let switchLabel: HTMLLabelElement | null | undefined;

function iosSwitch(): HTMLLabelElement | null {
  if (switchLabel !== undefined) return switchLabel;
  if (typeof document === "undefined") return (switchLabel = null);
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText =
    "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;
  label.append(input);
  document.body.append(label);
  return (switchLabel = label);
}
