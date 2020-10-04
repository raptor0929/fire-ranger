const TimeSeries = require('./TimeSeries');
const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  try {
    console.log(process.env.MY_PROFILE_TOKEN);
    const octokit = github.getOctokit(process.env.MY_PROFILE_TOKEN);
    const { data: user } = await octokit.users.getAuthenticated();

    const REPO_NAME = user.login;

    const {
      data: { sha },
    } = await octokit.repos.getContent({
      path: 'data.json',
      owner: user.login,
      repo: REPO_NAME,
    });

    const timeSeries = await TimeSeries.fetchTimeSeries();

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: REPO_NAME,
      path: 'backend/data.json',
      sha,
      message: 'Update cases data',
      committer: {
        name: user.name,
        email: user.email,
      },
      content: Buffer.from(JSON.stringify(timeSeries)).toString('base64'),
    });

    console.log(data);
  } catch (err) {
    core.setFailed(err);
  }
}

run();
