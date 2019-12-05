import { useState } from 'react';
import { useInterval } from './use_interval';
import React from 'react';
import { Box } from 'ink';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Spinner() {
  const [frame, setFrame] = useState(0);
  useInterval(() => setFrame(f => (f + 1) % frames.length), 60);

  return <Box>{frames[frame]}</Box>;
}
