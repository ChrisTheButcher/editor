var connect = require('connect')
    grunt = require('grunt');

//Run the tasks
//grunt.tasks('default', {}, function() {
//    
//});

console.log('Start the webserver on port 8888');

//Setup a static-file webserver
connect().use(connect.static(__dirname + '/build')).listen(8888);