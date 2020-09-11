import { Text, Box } from 'ink';
import React, { useState, useEffect } from 'react';
import { getRecentBuilds, RecentBuild, getBuildDetails } from './api';
import windowSize from 'window-size';
import { useInterval } from './use_interval';
import moment from 'moment';
import { VersionUpdater } from './version_updater';
import { Spinner } from './spinner';

interface Props {
  token: string;
}

export function Cli({ token }: Props) {
  const [recentBuilds, setRecentBuilds] = useState<RecentBuild[] | null>(null);
  const [estimatedTimes, setEstimatesTimes] = useState<Record<string, number>>(
    {},
  );

  // Fetch recent builds on startup and every 5 seconds.
  useEffect(() => {
    getRecentBuilds(token).then((builds) =>
      setRecentBuilds(builds.slice(0, windowSize.height - 4)),
    );
  }, []);
  useInterval(() => {
    getRecentBuilds(token).then((builds) =>
      setRecentBuilds(builds.slice(0, windowSize.height - 4)),
    );
  }, 5000);

  // When recent builds change, load the last successful builds for estimation.
  useEffect(() => {
    if (recentBuilds === null) {
      return;
    }
    recentBuilds.forEach(async (recentBuild) => {
      const identifier = buildIdentifier(recentBuild);
      if (
        estimatedTimes.hasOwnProperty(identifier) ||
        recentBuild.lifecycle !== 'running'
      ) {
        return;
      }
      setEstimatesTimes((times) => ({ ...times, [identifier]: 0 }));
      const buildDetails = await getBuildDetails(token, recentBuild);
      setEstimatesTimes((times) => ({
        ...times,
        [identifier]: buildDetails.previous_successful_build.build_time_millis,
      }));
    });
  }, [estimatedTimes, recentBuilds, setEstimatesTimes]);

  if (recentBuilds === null) {
    return <Spinner />;
  }

  // Get column width to calculate width of progress bar.
  const maxSizeRepo = Math.max(
    ...recentBuilds.map((build) => String(build.reponame).length),
  );
  const maxSizeBuildNumber = Math.max(
    ...recentBuilds.map((build) => String(build.build_num).length),
  );
  const maxSizeBranch = Math.max(
    ...recentBuilds.map((build) => String(build.branch).length),
  );

  return (
    <>
      <VersionUpdater />
      {recentBuilds.map((recentBuild) => (
        <Build
          key={`${recentBuild.reponame}-${recentBuild.build_num}`}
          build={recentBuild}
          sizeRepo={maxSizeRepo}
          sizeBuildNumber={maxSizeBuildNumber}
          sizeBranch={maxSizeBranch}
          estimatedTime={estimatedTimes[buildIdentifier(recentBuild)]}
        />
      ))}
    </>
  );
}

function buildIdentifier(build: RecentBuild) {
  const { build_num, reponame, username } = build;
  return `${username}#${reponame}#${build_num}`;
}

interface BuildProps {
  build: RecentBuild;
  sizeRepo: number;
  sizeBuildNumber: number;
  sizeBranch: number;
  estimatedTime?: number;
}

function Build(props: BuildProps) {
  const { build, sizeRepo, sizeBuildNumber, sizeBranch, estimatedTime } = props;
  const sizeProgress =
    windowSize.width - (sizeRepo + sizeBuildNumber + sizeBranch);
  const color =
    build.outcome === 'success'
      ? 'green'
      : build.outcome === 'failed'
      ? 'red'
      : undefined;
  return (
    <Box>
      <Text color={color}>
        {build.reponame.padEnd(sizeRepo + 1)}
        {String(build.build_num).padEnd(sizeBuildNumber + 1)}
        {build.branch.padEnd(sizeBranch + 1)}
        <Progress
          build={build}
          sizeProgress={sizeProgress}
          estimatedTime={estimatedTime}
        />
      </Text>
    </Box>
  );
}

interface ProgressProps {
  build: RecentBuild;
  sizeProgress: number;
  estimatedTime?: number;
}

function Progress(props: ProgressProps) {
  const { build, sizeProgress, estimatedTime } = props;

  if (build.lifecycle === 'finished') {
    return <Text>{build.build_url}</Text>;
  }

  if (build.lifecycle === 'not_run') {
    return <Text>Not Run</Text>;
  }

  if (build.lifecycle !== 'running') {
    return <Text>Queued ...</Text>;
  }

  if (!estimatedTime) {
    return <Spinner />;
  }

  const freeSpace = sizeProgress - 10;

  const fraction = moment().diff(moment(build.start_time)) / estimatedTime;
  const percent = Math.floor(fraction * 100);

  const bars = Math.min(Math.floor(freeSpace * fraction), freeSpace);

  return (
    <Text>
      [{'='.repeat(bars).padEnd(freeSpace)}] {String(percent).padStart(3)}%
    </Text>
  );
}
