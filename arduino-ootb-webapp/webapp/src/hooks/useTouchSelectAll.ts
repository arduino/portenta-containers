import { useCallback } from "react";

export function useTouchSelectAll() {
  return useCallback((e: React.TouchEvent<HTMLSpanElement>) => {
    const range = document.createRange();
    range.selectNodeContents(e.currentTarget as HTMLSpanElement);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);
}
