#!/bin/bash

# Couleurs pour les logs
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Lancement du backend avec Docker Compose...${NC}"
./toggle-config.sh --inside
docker-compose up --build -d

# Attendre quelques secondes pour laisser le backend démarrer correctement
echo -e "${GREEN}⏳ Attente du démarrage du backend...${NC}"
sleep 10

# Vérification que Docker a bien lancé les services
if ! docker ps | grep -q 'product-service'; then
  echo -e "${RED}❌ Erreur : Le backend ne semble pas démarré correctement.${NC}"
  exit 1
fi

# Aller dans le dossier du frontend (modifie cette ligne si besoin)
cd frontend || { echo "❌ Dossier 'frontend' introuvable."; exit 1; }

npm install

echo -e "${GREEN}🌐 Lancement du frontend Angular avec proxy...${NC}"
ng serve --proxy-config proxy.conf.json
