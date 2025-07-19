# MongoDB Docker

Ce document permet de lancer un conteneur MongoDB à partir d’un Dockerfile basé sur l’image officielle `mongo`.

## 🔧 Build de l’image

Assurez-vous d’avoir Docker installé, puis exécutez la commande suivante dans le dossier contenant le Dockerfile :

```bash

docker build -t my-mongo .

```
🚀 Lancement du conteneur

Une fois l’image construite, lancez MongoDB avec la commande :

```bash

docker run -d -p 27017:27017 --name mongodb-container my-mongo

```
MongoDB sera alors accessible sur le port 27017 de votre machine locale.

🛑 Arrêter et supprimer le conteneur

Pour arrêter et supprimer le conteneur :

```bash

docker stop mongodb-container

docker rm mongodb-container

```
