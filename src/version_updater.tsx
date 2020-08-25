import React from 'react';
import { Text } from 'ink';
import boxen, { BorderStyle } from 'boxen';
import packageJson from '../package.json';
import { useState, useEffect } from 'react';
import updateNotifier, { UpdateInfo } from 'update-notifier';
import chalk from 'chalk';

export function VersionUpdater() {
  const [status, setStatus] = useState<UpdateInfo | undefined>(undefined);

  useEffect(() => {
    const notifier = updateNotifier({ pkg: packageJson });
    Promise.resolve(notifier.fetchInfo()).then(setStatus);
  }, []);

  if (status && status.current !== status.latest) {
    const message =
      'Update available ' +
      chalk.dim(status.current) +
      chalk.reset(' → ') +
      chalk.green(status.latest) +
      ' \nRun ' +
      chalk.cyan(`npm i -g ${packageJson.name}`) +
      ' to update';

    return (
      <Text>
        {boxen(message, {
          padding: 1,
          margin: 1,
          align: 'center',
          borderColor: 'yellow',
          borderStyle: BorderStyle.Round,
        })}
      </Text>
    );
  }
  return null;
}
