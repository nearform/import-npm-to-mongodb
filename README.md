# import-npm-to-mongodb

Simple Node script that imports npm to a mongodb.

```
# assuming you have a mongodb running
npx import-npm-to-mongodb
```

The modules are stored in the `db.modules`.

Useful if you need a dataset for testing.

# Docker image

There is also a Docker image available with the data

```sh
docker pull mafintosh/npm-in-mongo
docker run -it -p 27017:27017 mafintosh/npm-in-mongo
```
