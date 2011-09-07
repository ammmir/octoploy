# octoploy

A simple deployment server for GitHub post-receive hooks.

## Usage

Create an executable `octoploy.sh` file in the root of your repo that will
perform post-receive actions to deploy the new code, such as calling
`npm update` and restarting your app.

Start the server with:

    ./octoploy.js /path/to/repo

octoploy doesn't have any security or access control, so be sure to
put it behind a reverse proxy or use a firewall to restrict access. It
listens on 127.0.0.1:8079 by default.

When a notification payload is received from GitHub, octoploy runs
`git pull` and executes `./octoploy.sh` in the repo. Don't forget to
add a deploy key to your repo on GitHub so the user account that octoploy
runs under has access to your code.

octoploy doesn't offer rollback, so just commit a new change and push it
so it can be deployed as usual.

## nginx config

In your nginx configuration, add an upstream:

    upstream octoploy {
      server 127.0.0.1:8079;
    }

In your server block, add a secret location that will forward requests
to octoploy:

    location = /_/yourSecretStringHere/deploy {
      proxy_pass http://octoploy;
      break;
    }

octoploy doesn't care what URL hits it, so any location will do. Use
the full URL when configuring the post-receive hook on GitHub.
