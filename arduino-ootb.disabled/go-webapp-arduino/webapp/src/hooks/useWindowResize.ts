import { useEffect } from "react";

export function useWindowResize(callback: () => void) {
  useEffect(() => {
    function handleResize() {
      callback();
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [callback]);
}
