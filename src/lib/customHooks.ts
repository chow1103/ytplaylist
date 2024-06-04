// https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs

import { useState, useEffect } from 'react';

function getWindowDimensions() {
  if (typeof window !== 'undefined') {
    const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
    return {
      windowWidth,
      windowHeight,
    };
  }
  return {
    windowWidth: 0,
    windowHeight: 0,
  };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
