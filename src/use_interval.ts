import { useEffect, useRef } from 'react';

// Taken from https://overreacted.io/making-setinterval-declarative-with-react-hooks/

type Callback = () => void;

export function useInterval(callback: Callback, delay: number | null) {
  const savedCallback = useRef<Callback>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current!();
    }
    if (delay === null) {
      return undefined;
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
