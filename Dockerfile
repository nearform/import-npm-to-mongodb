FROM mongo

RUN apt-get update && apt-get -y install curl psmisc sudo
RUN curl -fs https://raw.githubusercontent.com/mafintosh/node-install/master/install | sh
RUN node-install 8
RUN mkdir -p npmdb
RUN (mongod --dbpath npmdb &) && npx import-npm-to-mongodb 400000 && killall mongod

EXPOSE 27017
CMD ["sudo", "mongod", "--dbpath", "npmdb", "--bind_ip_all"]
