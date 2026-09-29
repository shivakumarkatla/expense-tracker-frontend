import { useEffect, useRef, useState } from "react";

function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = (
    message,
    type = "success"
  ) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({
      message,
      type,
    });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const hideToast = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}

export default useToast;