const functions = require("firebase-functions");

const { Octokit } = require("@octokit/rest");
const { Base64 } = require("js-base64");

exports.publishArticles = functions
  .region("europe-west1")
  .runWith({ secrets: ["GITHUB_API"] })
  .https.onCall(async (data, context) => {
    await syncWithGithub(process.env.GITHUB_API);

    return {
      success: true,
    };
  });

async function syncWithGithub(token) {
  const octokit = new Octokit({
    auth: token,
  });

  await commitArticle({
    title: "title",
    content: "body of article",
  });

  // SHA is required if updating an existing file
  async function getSHA(path) {
    const result = await octokit.repos.getContent({
      owner: "activisthandbook",
      repo: "activisthandbook",
      path,
    });

    const sha = result.data.sha;

    return sha;
  }

  async function commitArticle(article) {
    const path = `mypath`;
    const sha = await getSHA(path);

    // possible alternative for multiple files https://github.com/mheap/octokit-commit-multiple-files
    // another solution: https://gist.github.com/StephanHoyer/91d8175507fcae8fb31a
    // yet another one
    const result = await octokit.repos.createOrUpdateFileContents({
      owner: "activisthandbook",
      repo: "activisthandbook",
      path,
      message: `Add article "${article.title}"`,
      content: Base64.encode(article.content),
      sha,
    });

    // return result.status || 500;
  }
}

// https://codelounge.dev/getting-started-with-the-githubs-rest-api#write-comment
// async function pushFiles(token) {
//   const octokit = new Octokit({
//     auth: token,
//   });

//   const owner = "activisthandbook";
//   const repo = "activisthandbook";
//   author = {
//     name: "Activist Handbook",
//     email: "contact@activisthandbook.org",
//   };
//   const url = "/repos/{owner}/{repo}/{path}"; // leave this as is
//   const ref = "heads/main"; // 'master' represents the name of my primary branch

//   //git pull
//   const commits = await octokit.repos.listCommits({
//     owner,
//     repo,
//   });

//   const latestCommitSHA = commits.data[0].sha;

//   // make changes
//   const files = [
//     {
//       mode: "100644",
//       path: "src/file1.txt",
//       content: "Hello world 1", //whatever
//     },
//     {
//       mode: "100644",
//       path: "src/file2.txt",
//       content: "Hello world 2",
//     },
//   ];

//   // git add .
//   const {
//     data: { sha: treeSHA },
//   } = await octokit.git.createTree({
//     owner,
//     repo,
//     tree: files,
//     base_tree: latestCommitSHA,
//   });

//   // git commit -m 'Changes via API'
//   const {
//     data: { sha: newCommitSHA },
//   } = await octokit.git.createCommit({
//     owner,
//     repo,
//     author,
//     tree: treeSHA,
//     message: "Changes via API",
//     parents: [latestCommitSHA],
//   });

//   // git push origin HEAD
//   const result = await octokit.git.updateRef({
//     owner,
//     repo,
//     ref,
//     sha: newCommitSHA,
//   });
// }

// https://github.com/PaulKinlan/podcastinabox-editor/blob/master/record/javascripts/main.mjs
// async function createCommit(token) {

//   const octokit = new Octokit({ auth: token });

//   // const github = new Octokat({ token: token });
//   const owner = "activisthandbook";
//   const repoName = "activisthandbook";
//   const markdownPath = `docs/${filename}`;
//   const filename = "testfile";
//   const commitMessage = "test commit message";

//   // let repo = await github.repos(user, repoName).fetch();
//   let repo = await octokit.rest.repos.get({
//     owner,
//     repo,
//   });
//   let main = await repo.git.refs("heads/main").fetch();
//   let treeItems = [];

//   let markdownFile = await repo.git.blobs.create({
//     content: btoa(jsonEncode(data)),
//     encoding: "base64",
//   });

//   treeItems.push({
//     path: markdownPath,
//     sha: markdownFile.sha,
//     mode: "100644",
//     type: "blob",
//   });

//   let tree = await repo.git.trees.create({
//     tree: treeItems,
//     base_tree: main.object.sha,
//   });

//   let commit = await repo.git.commits.create({
//     message: `${commitMessage}`,
//     tree: tree.sha,
//     parents: [main.object.sha],
//   });

//   main.update({ sha: commit.sha });
// }
//
