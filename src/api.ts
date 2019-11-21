import axios from 'axios';

type Lifecycle =
  | 'queued'
  | 'scheduled'
  | 'not_run'
  | 'not_running'
  | 'running'
  | 'finished';

type Outcome =
  | 'canceled'
  | 'infrastructure_fail'
  | 'timedout'
  | 'failed'
  | 'no_tests'
  | 'success';

export interface RecentBuild {
  // vcs_type: string;
  username: string;
  reponame: string;
  branch: string;
  build_num: number;
  build_url: string;
  start_time: string;
  lifecycle: Lifecycle;
  outcome: Outcome;
}

export async function getRecentBuilds(token: string): Promise<RecentBuild[]> {
  const response = await axios.get(
    `https://circleci.com/api/v1.1/recent-builds?shallow=true`,
    { auth: { username: token, password: '' } },
  );
  return response.data;
}

interface Build {
  previous_successful_build: {
    build_time_millis: number;
  };
}

export async function getBuildDetails(
  token: string,
  recentBuild: RecentBuild,
): Promise<Build> {
  const response = await axios.get(
    `https://circleci.com/api/v1.1/project/github/${recentBuild.username}/${recentBuild.reponame}/${recentBuild.build_num}`,
    { auth: { username: token, password: '' } },
  );
  return response.data;
}
