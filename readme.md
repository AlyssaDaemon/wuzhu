> [!WARNING]
> This is now read only, it hasn't been touched in 10 years.
> It was an interesting idea, but never had the time to work on it.

A Simple, progressive webapp ready wiki. It's nowhere near ready yet, but it's getting there.

# Install
```
$ git clone "https://github.com/AlyssaDaemon/wuzhu.git" wuzhu
$ cd wuzhu
$ npm install
$ $EDITOR config.json #There's a config.json.example you could copy or move
$ gulp
```
Then just serve the build directory with your favourite web server. For it to work as a ProgressiveWebApp™ Google and others require it to be served over HTTPS,
so please keep that in mind. It will still work without HTTPS, you just lose caching so no offline mode. (Could be solved with an appcache, pull requests welcome).

# Requirements
* A working CouchDB server, serving over HTTPS hopefully
* You'll need to set a config.json file in root that at least has the keys: "db_name" and "db_host". These set the name and the host for the local and remote databases.

# TODO
* Signup (can login, but not signup)
* Deal with conflicts, currently it just errors.
