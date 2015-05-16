Minimal Courier architecture example
====================================

The repository demonstrates a minimal example of a client architecture
described at http://baatz.io/posts/courier-reactive-react-architecture/, using
reactive programming (dataflow) and immediate mode UI rendering:

![A diagram of the courier architecture](courier.png)

The code is heavily commented and intended to be easy to skim. In a realistic
application, the different parts would be split into their own modules / files,
but I've kept them in one file to make it easier to get an overview.

This example uses Kefir and React, but you can use whichever libraries you
prefer. To try the example, do:

    npm install .
    npm start

If you want to experiment, you run a watcher with:

    node_modules/gulp/bin/gulp.js watch

You can also get live reload with the LiveReload [Chrome
extension](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei).
