# Docker Compose with Sails

In this documentation we will walk through the process of starting a docker-compose.yml file to automate the process of lift a sails server with its databases.

In our case we are going to use 3 containers:
 - Sails
 - Postgresql (main database)
 - Redis (session database)

## Requirements
 - Docker
 - Docker-compose
 - Sails
 - One or more database container

## Containers creation

We need to create our first container (sails).

```
#Dockerfile

FROM kallikrein/sails:0.11.0

RUN npm install nodemon -g

EXPOSE 1337

WORKDIR /usr/src/app

CMD ["nodemon",  "/usr/src/app/", "-w", "api"]
```

The sails container is as simple as it can be. We just added nodemon to restart the sails server without restarting the whole container.

## Docker-compose.yml

```
web:
  build: .
  restart: always
  command: nodemon /usr/src/app/ -w /usr/src/app/api
  ports:
    - "1337:1337"
  volumes:
    - .:/usr/src/app
  links:
    - postgresql:mainDB
    - redis:sessionDB

postgresql:
  image: sameersbn/postgresql:9.4
  restart: always
  volumes:
    - /opt/postgresql/data:/var/lib/postgresql
  ports:
    - "5432:5432"
  environment:
    - DB_USER=$DB_USER
    - DB_PASS=$DB_PASS
    - DB_NAME=$DB_NAME
    - PSQL_TRUST_LOCALNET=true

redis:
  image: redis:latest
  restart: always
```

Here we can see we have 3 main blocks:
- web
- postgresql
- redis

Those 3 blocks define our 3 containers that we want to be working together.

Each container is field with several options to act as we expect it.

## Linking containers together

This part is the most important one.

In the web blocks we have:
```
  links:
    - postgresql:mainDB
    - redis:sessionDB
```

Thoses lines determine how the containers are linked and how we can access them from inside the web containers.

When docker-compose run with links, for every linked containers the ENV of the parents is changed. In our case ENV web looks like this:

```
SESSIONDB_PORT=tcp://172.17.0.229:6379
SESSIONDB_PORT_6379_TCP=tcp://172.17.0.229:6379
SESSIONDB_PORT_6379_TCP_ADDR=172.17.0.229
SESSIONDB_PORT_6379_TCP_PORT=6379
SESSIONDB_PORT_6379_TCP_PROTO=tcp
SESSIONDB_NAME=/server_web_1/sessionDB
SESSIONDB_ENV_REDIS_VERSION=3.0.3
SESSIONDB_ENV_REDIS_DOWNLOAD_URL=http://download.redis.io/releases/redis-3.0.3.tar.gz
SESSIONDB_ENV_REDIS_DOWNLOAD_SHA1=0e2d7707327986ae652df717059354b358b83358
MAINDB_PORT=tcp://172.17.0.231:5432
MAINDB_PORT_5432_TCP=tcp://172.17.0.231:5432
MAINDB_PORT_5432_TCP_ADDR=172.17.0.231
MAINDB_PORT_5432_TCP_PORT=5432
MAINDB_PORT_5432_TCP_PROTO=tcp
MAINDB_NAME=/server_web_1/mainDB
MAINDB_ENV_DB_PASS=$DB_PASS
MAINDB_ENV_DB_NAME=$DB_NAME
MAINDB_ENV_DB_USER=$DB_USER
MAINDB_ENV_PSQL_TRUST_LOCALNET=true
MAINDB_ENV_PG_VERSION=9.4
```

We can see that the references to the linkeds containers are stored in the parent's env. We will get back to this in the next step.

## Linking in Sails

In Sails the links occurs in 3 different places:
```
server/config/connections.js
server/config/models.js
server/config/session.js
```


#### Connection.js

In connection.js we need to add our own connector:

```
mainDB: {
    adapter: 'sails-postgresql',
    host: 'mainDB',
    user: process.env.MAINDB_ENV_DB_USER,
    password: process.env.MAINDB_ENV_DB_PASS,
    database: process.env.MAINDB_ENV_DB_NAME
}
```

Here we can see that we access to the env variable from MAINDB via process.env in order to access the database

#### Models.js

In models.js we need to change the default connector:

```
connection: 'mainDB',
```

#### Session.js

In session.js we need to activate the redis connector:

```
adapter: 'redis',

  /***************************************************************************
  *                                                                          *
  * The following values are optional, if no options are set a redis         *
  * instance running on localhost is expected. Read more about options at:   *
  * https://github.com/visionmedia/connect-redis                             *
  *                                                                          *
  *                                                                          *
  ***************************************************************************/

host: 'sessionDB',
port: 6379,
// ttl: <redis session TTL in seconds>,
// db: 0,
// pass: <redis auth password>,
prefix: 'sess:',

```

## Docker-compose up

Everything is set you can now run your app with `docker-compose up [-d]` !
