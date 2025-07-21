# MongoDB Docker

Ce document permet de lancer un conteneur MongoDB à partir d’un Dockerfile basé sur l’image officielle `mongo`.

## 🔧 Build de l’image

Assurez-vous d’avoir Docker installé, puis exécutez la commande suivante dans le dossier contenant le Dockerfile :

Pour démarrer: docker run -d   --name user-mongodb   -p 27017:27017   -e MONGO_INITDB_ROOT_USERNAME=root   -e MONGO_INITDB_ROOT_PASSWORD=secret   mongo:latest

```
MongoDB sera alors accessible sur le port 27017 de votre machine locale.

🛑 Arrêter et supprimer le conteneur

Pour arrêter et supprimer le conteneur :

```bash

docker stop mongodb-container

docker rm mongodb-container

```


Erreur fixed:

docker: Error response from daemon: Conflict. The container name "/user-mongodb" is already in use by container "0c480b85e87635a45fedf9292737ce4f310104b097c3358d1de93f870e3c49d9". You have to remove (or rename) that container to be able to reuse that name.

Run 'docker run --help' for more information

slash2boom@slash2boom-HP-EliteBook-745-G6:~/buy-01/backend/database$ docker rm user-mongodb
user-mongodb

slash2boom@slash2boom-HP-EliteBook-745-G6:~/buy-01/backend/database$ docker run -d   --name user-mongodb   -p 27017:27017   -e MONGO_INITDB_ROOT_USERNAME=root   -e MONGO_INITDB_ROOT_PASSWORD=secret   mongo:latest

d2cbb5dbb8af9c2412b8225a9dda2869c6c756719ec129f62d54834db0b76189

slash2boom@slash2boom-HP-EliteBook-745-G6:~/buy-01/backend/database$ docker ps

CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                                             NAMES
d2cbb5dbb8af   mongo:latest   "docker-entrypoint.s…"   8 seconds ago   Up 7 seconds   0.0.0.0:27017->27017/tcp, [::]:27017->27017/tcp   user-mongodb
