Dashboard
=========

[![wercker status](https://app.wercker.com/status/0d1dbce7b17a8fc14016760e30709afc/m "wercker status")](https://app.wercker.com/project/bykey/0d1dbce7b17a8fc14016760e30709afc)


## Workflow with gulp

### Build
Builds project and moves files on the destination folder. Makes concat and minify css and JS. Compiling SASS to css. Checks JS on errors using JSHint

    gulp build
    
### Run Client in Development Mode
Moves images, bower-files into destination folder. Compiling sass. Adds watcher on a changes in css, scss, js, html and images. After a change these files browser automatically will be update  content

    gulp build && gulp dev
    or
    gulp build && gulp serve
    
### Run Unit Tests
Not configured yet. Will be realized in the near future
    
    gulp test
        
### Also useful are the following commands
    gulp jshint // check js on errors
    gulp sass   // Makes compilation sass to css
    gulp clean  // Removes the _dist_ folder

### How to run ottemo/storefront docker container
Pull latest image from docker hub

    docker pull ottemo/dashboard

For dev start the container with gulp serve

    docker run -d -p 9000:9000 -t ottemo/storefront gulp serve

For stg and prod start the container using nginx

    docker run -d -p 9000:9000 -t ottemo/storefront service nginx start    
