#!/bin/bash

# Couleurs pour les logs
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🛑 Arrêt du frontend Angular...${NC}"

# Trouver le PID du processus ng serve
NG_PID=$(ps aux | grep "ng serve" | grep -v grep | awk '{print $2}')

if [ -z "$NG_PID" ]; then
  echo "✅ Aucun processus Angular (ng serve) en cours."
else
  echo "🔍 PID Angular trouvé : $NG_PID"
  kill -9 "$NG_PID"
  echo "✅ Frontend Angular arrêté."
fi

echo -e "${GREEN}🛑 Arrêt des conteneurs Docker...${NC}"
docker-compose down

echo -e "${GREEN}✅ Projet arrêté avec succès.${NC}"
