angular.module('rdfvis.services').factory('netGraph',netGraph);
netGraph.$inject = [];

function netGraph () {
var serv = this;
serv.logs = [];

function hello()
{
alert("hello");
console.log("hllo");
}

return serv;
}

