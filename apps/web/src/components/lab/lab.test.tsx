import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { useLabFlag, Variants } from "@/components/lab";
import LabPanel from "@/components/lab/panel";
import { resetAll, setValue } from "@/components/lab/store";

const Plain = ({ text }: { text: string }) => <p>plain {text}</p>;
const Loud = ({ text }: { text: string }) => <p>LOUD {text}</p>;

function Greeting() {
  return (
    <Variants id="greeting" label="Greeting" options={{ Plain, Loud }} props={{ text: "hi" }} />
  );
}

function Badge() {
  return useLabFlag("badge", { label: "Show badge" }) ? <span>badge</span> : null;
}

afterEach(() => {
  act(resetAll);
  localStorage.clear();
});

describe("lab", () => {
  it("renders the first option until the panel picks another", () => {
    render(
      <>
        <Greeting />
        <LabPanel />
      </>,
    );
    expect(screen.getByText("plain hi")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: /Loud/ }));
    expect(screen.getByText("LOUD hi")).toBeTruthy();
    expect(screen.queryByText("plain hi")).toBeNull();
  });

  it("keeps the pick when the component mounts again", () => {
    const { unmount } = render(<Greeting />);
    act(() => setValue("greeting", "Loud"));
    unmount();

    render(<Greeting />);
    expect(screen.getByText("LOUD hi")).toBeTruthy();
  });

  it("falls back to the first option when the picked one is gone", () => {
    act(() => setValue("greeting", "Deleted"));
    render(<Greeting />);
    expect(screen.getByText("plain hi")).toBeTruthy();
  });

  it("toggles a flag", () => {
    render(
      <>
        <Badge />
        <LabPanel />
      </>,
    );
    expect(screen.queryByText("badge")).toBeNull();

    fireEvent.click(screen.getByRole("checkbox", { name: "Show badge" }));
    expect(screen.getByText("badge")).toBeTruthy();
  });

  it("lists only the controls on screen, and hides with none", () => {
    const { rerender } = render(
      <>
        <Greeting />
        <Badge />
        <LabPanel />
      </>,
    );
    expect(screen.getByRole("group", { name: "Greeting" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Show badge" })).toBeTruthy();

    rerender(
      <>
        <Badge />
        <LabPanel />
      </>,
    );
    expect(screen.queryByRole("group", { name: "Greeting" })).toBeNull();

    rerender(<LabPanel />);
    expect(screen.queryByRole("complementary", { name: "Lab" })).toBeNull();
  });
});
