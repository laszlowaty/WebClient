import { useState, useEffect } from 'react';

const getVisibility = () => {
  if (typeof document === "undefined") return true;
  return document.visibilityState;
}

export const useDocumentVisibility = () => {
  let [documentVisibility, setDocumentVisibility] = useState(getVisibility());

  function handleVisibilityChange() {
    setDocumentVisibility(getVisibility());
  }

  useEffect(() => {
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return documentVisibility;
}
