Requirements
-----------
 - nodejs
 - npm

Installation
------------  
    $ git clone https://github.com/grzegorznyga/static-site-starter.git
    $ cd static-site-starter
    $ npm install
    
    
Starting with a new project repository
----------
The quickest and easiest way to start with your own project is to use an existing template project repository. 

Create a local copy of a project, Go to a new project directory. Remove the versions history of the origin repository, create a new git repository from that directory and install all npm dependances.

    $ git clone https://github.com/grzegorznyga/static-site-starter.git new-project
    $ cd new-project/
    $ rm -rf .git
    $ git init
    $ npm install