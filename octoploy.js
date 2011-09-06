#!/usr/bin/env node
/**
 * octoploy.js
 * Octoploy server
 *
 * @author Amir Malik
 */

var http = require('http'),
    exec = require('child_process').exec,
      fs = require('fs');

var sIsDeploying = false,
    sLastCommitId,
    sLastDeploy = new Date(0),
    sRepoPath;

var server = http.createServer(function(req, res) {
  var data = '';

  req.on('data', function(chunk) {
    data += chunk.toString();
  });

  req.on('end', function() {
    var payload;

    try {
      payload = JSON.parse(decodeURIComponent(data.replace('payload=', '')));
      console.log('GitHub payload', payload);
    } catch(e) {
      console.error('JSON parse error: %s', data, e);
      res.writeHead(500);
      return res.end();
    }

    var      repo_name = payload.repository.name,
        last_commit_id = payload.commits[0].id,
        last_committer = payload.commits[0].author.name;

    console.log('push %s latest commit %s by %s', repo_name, last_commit_id, last_committer);

    if(sLastCommitId === last_commit_id) {
      console.error('skipping duplicate deploy!');
      res.writeHead(200);
    } else if(sIsDeploying) {
      res.writeHead(500);
    } else {
      res.writeHead(200);

      var child = exec('/usr/bin/git pull', {cwd: sRepoPath}, function(err, stdout, stderr) {
        if(err) {
          console.error('error excuting git pull', err);
          console.error('stdout: ' + stdout);
          console.error('stderr: ' + stderr);
          sIsDeploying = false;
          return;
        }

        console.log('git pull success:\n' + stdout);

        exec('./octoploy.sh', {cwd: sRepoPath}, function(err, stdout, stderr) {
          sIsDeploying = false;

          if(err) {
            console.error('unable to call deploy script', err);
            console.error('stdout: ' + stdout);
            console.error('stderr: ' + stderr);
            return;
          }

          console.log('deploy complete.');

          sLastDeploy = new Date();
        });
      });
    }

    res.end();
  });

  res.writeHead(200);
});

if(process.argv.length < 3) {
  console.error('usage: ./octoploy.js <path to git repo>');
  process.exit(1);
} else {
  try {
    fs.statSync(process.argv[2]);
  } catch(e) {
    console.error('octoploy error:', e.message);
    process.exit(1);
  }

  sRepoPath = process.argv[2];

  server.listen(8079, '127.0.0.1');
  console.log('octoploy ready!');
}
