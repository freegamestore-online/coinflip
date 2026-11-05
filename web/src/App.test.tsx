import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

const total = () => Number(screen.getByText("Total").previousSibling?.textContent);
const coin = () => screen.getByRole("button", { name: "Flip the coin" });
const flip = () => {
  fireEvent.click(coin());
  act(() => { vi.advanceTimersByTime(700); });
};

describe("App", () => {
  beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
  afterEach(() => vi.useRealTimers());

  it("counts every flip, not just the last 20, and persists the totals", () => {
    const { unmount } = render(<App />);
    for (let i = 0; i < 25; i++) flip();
    expect(total()).toBe(25);
    expect(screen.getByLabelText("recent flips").textContent!.split(" ")).toHaveLength(20);
    unmount();
    render(<App />);
    expect(total()).toBe(25);
  }, 30_000);

  it("Restart clears the saved totals", () => {
    render(<App />);
    flip();
    fireEvent.click(screen.getByRole("button", { name: "Restart" }));
    expect(total()).toBe(0);
  });

  it("the coin keeps spinning forward instead of rotating back on landing", () => {
    render(<App />);
    flip();
    const after1 = coin().style.transform;
    flip();
    expect(after1).toContain("rotateY(1080deg)");
    expect(coin().style.transform).toContain("rotateY(2160deg)");
  });

  it("Space flips the coin", () => {
    render(<App />);
    fireEvent.keyDown(window, { code: "Space", key: " " });
    act(() => { vi.advanceTimersByTime(700); });
    expect(total()).toBe(1);
  });

  it("clears the landing timer on unmount", () => {
    const idle = render(<App />);
    idle.unmount();
    const baseline = vi.getTimerCount(); // timers the SDK shell leaves behind
    const { unmount } = render(<App />);
    fireEvent.click(coin());
    unmount();
    expect(vi.getTimerCount()).toBe(baseline);
  });
});
