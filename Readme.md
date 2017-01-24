Universum
=========

Installation
------------

```bash
npm install
bower install https://github.com/EntityB/gamee-js
grunt
```

Run
---

```bash
python -m SimpleHTTPServer 8081
```

enter localhost:
[http://localhost:8081](http://localhost:8081)

Alternative with github cdn:
[https://cdn.rawgit.com/EntityB/universum-gamee/master/index.html](https://cdn.rawgit.com/EntityB/universum-gamee/master/index.html)

TODO
----

* use gamee lib

About project
-------------

* Game is WebGL based. It is primary fragment based logic, which might not achieve the best performance, but can open some doors. 
* Game doesn't use any third party engine. In fact, there is no engine at all. Just code for local purposes. 
* There is webgl debugger even in distro build. 
* So far game doesn't run on mobile. The reason seems to be there is procedural based simplex noise that glitches on mobile device GPU. Plan is rewrite it to texture based simplex noise, it should fix the problem. 
* I'm using grunt for builds. Building is dynamic (just run `grunt watch`). File dependency is done with JSdoc. If one file contains "@require \<object name\>", grunt will look for file containing "@class \<object name\>". 
* It using changed version of gamee-js, because there was some problem with origin version. It didn't run on desktop properly. Modified version can be found here: https://github.com/EntityB/gamee-js
