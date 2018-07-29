#!/usr/bin/env node

const mongojs = require('mongojs')
const get = require('simple-get')
const pump = require('pump')
const each = require('stream-each')
const ndjson = require('ndjson')

// make sure to have mongodb running
const db = mongojs('localhost:27017/npm', ['modulesIndexed', 'modules'])
const max = Number(process.argv[2]) || Infinity

db.modulesIndexed.ensureIndex({modified: 1})

db.modulesIndexed.find({}).sort({seq: -1}).limit(1, function (err, docs) {
  if (err) throw err
  sync(docs.length ? docs[0].seq + 1 : 0, function (err) {
    if (err) throw err
    console.log('Done importing!')
  })
})

setInterval(function () {
  db.modules.count(function (_, n) {
    if (!n) return
    console.log('Imported ' + n + ' modules')
  })
}, 1000).unref()

function sync (since, cb) {
  console.log('Syncing since seq=' + since)
  const npm = `https://skimdb.npmjs.com/registry/_changes?feed=continuous&include_docs=true&since=${since}`
  get(npm, function (err, res) {
    if (err) return cb(err)
    each(pump(res, ndjson.parse()), ondata, cb)

    function ondata (data, cb) {
      if (!data.doc.time) return cb()

      const doc = {
        _id: data.id,
        seq: data.seq,
        version: data.doc['dist-tags'].latest,
        modified: data.doc.time.modified
      }

      db.modulesIndexed.save(doc, function (err) {
        if (err) return cb(err)
        db.modules.save(doc, function (err) {
          if (err) return cb(err)
          db.modulesIndexed.count(function (err, cnt) {
            if (err) return cb(err)
            if (cnt >= max) {
              console.log('Done importing!')
              return process.exit()
            }
            cb()
          })
        })
      })
    }
  })
}
