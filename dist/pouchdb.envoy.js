(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

exports.pull= function(remote) {
  
  // keep a reference to this (pouchdb)
  var target = this;
  var pouch = this;
  var PouchDB = pouch.constructor;
  
  // create a temporary PouchDB database
  var tempName = 'envoytemp' + new Date().getTime();
  var temp = new PouchDB(tempName);
  
  // empty it
  return temp.destroy().then(function() {
    // then recreate it
    temp = new PouchDB(tempName);
    
    // pull all docs from the remote
    return remote.allDocs();
  }).then(function(response) {
    var diffs = {};
    response.rows.forEach(function(row) {
      diffs[row.id]= [ row.value.rev ];
    });
    return target.revsDiff(diffs);
    
  }).then(function(response) {
    var docs = [];
    Object.keys(response).map(function(id) {
      docs.push({id: id});
    });
    return remote.bulkGet({docs: docs, revs:true});
    
  }).then(function(response) { 
 
    var docs = [];
    response.results.forEach(function(row) {
      row.docs.forEach(function(d) {
        docs.push(d.ok);
      });
    });

    return temp.bulkDocs(docs, {new_edits: false});
  }).then(function() {
    // replicate from temp DB to actual target
    return target.replicate.from(temp);
  })["catch"](function(error) {
    console.error("pouchdb-envoy error -", error);
  });
};

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports);
}

},{}]},{},[1]);
