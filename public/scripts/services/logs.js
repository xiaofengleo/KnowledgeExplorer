angular.module('rdfvis.services').factory('logService', logService);
logService.$inject = [];

function logService () {
  var serv = this;
  serv.logs = [];
  serv.add = add;


  function add (msg) {
    var entry = {
      date: new Date(),
      info: msg,
    }
    serv.logs.push(entry);
  }

  return serv;

}
