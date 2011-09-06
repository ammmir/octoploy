# octoploy

Simple deployment server for GitHub post-received hooks.

## Usage

Add an executable `octoploy.sh` file to the root of your repo that will
perform post-receive actions to deploy the new code (such as calling
`npm update` and restarting your app).

Start the server with:

    ./octoploy.js /path/to/repo

octoploy doesn't have any security or access control, so be sure to
put it behind a reverse proxy or use a firewall to restrict access. It
listens on 127.0.0.1:8079 by default.

When a notification payload is received from GitHub, octoploy runs
`git pull` and executes `./octoploy.sh` in the repo.

To rollback to a previous version of your code, push a new commit, so
octoploy can deploy it normally.
