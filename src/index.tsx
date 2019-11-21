#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import packageJson from '../package.json';
import { Cli } from './cli';
import Conf from 'conf';

const config = new Conf<{ token: unknown }>({
  projectName: packageJson.name,
});

async function run() {
  if (process.argv[2] === 'token' && typeof process.argv[3] === 'string') {
    config.set('token', process.argv[3]);
    console.log('Token set. Run "cci" again.');
    return;
  }

  if (process.argv.length > 2) {
    console.log(`Usage:`);
    console.log(`Set a token with: cci token <token>`);
    console.log(`Or just run: cci`);
  }

  const token = config.get('token');
  if (typeof token !== 'string') {
    console.log('You need to configure a CircleCI token first by running:');
    console.log('> cci token <token>');
    console.log('');
    console.log('Go to https://circleci.com/account/api to create one.');
    process.exit(1);
  }

  render(<Cli token={token} />);
}

run().catch(err => {
  console.error(err);
  process.exit(2);
});
