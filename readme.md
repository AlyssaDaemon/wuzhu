A Simple, progressive webapp ready wiki. It's nowhere near ready yet, but it's getting there.

# Requirements
* A working CouchDB server, serving over HTTPS hopefully
* You'll need to set a config.json file in root that at least has the keys: "db_name" and "db_host". These set the name and the host for the local and remote databases.

# TODO
* Signup (can login, but not logout or signup)
* User/settings view (to be able to see who is logged in and able to logout and maybe some settings)
* Deal with conflicts, currently it just errors.