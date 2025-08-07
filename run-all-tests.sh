#!/bin/bash

# Liste des services à tester
SERVICES=("user" "product" "media")
BASE_DIR="backend/api"

# Activer la configuration OUTSIDE
echo "🔧 Application de la configuration '--outside'..."
./toggle-config.sh --outside

if [ $? -ne 0 ]; then
  echo "❌ Erreur lors de l'application de la configuration outside."
  exit 1
fi

# Boucle sur chaque service
for SERVICE in "${SERVICES[@]}"; do
  SERVICE_DIR="$BASE_DIR/$SERVICE"
  echo ""
  echo "🧪 Lancement des tests pour [$SERVICE]..."

  if [ ! -f "$SERVICE_DIR/mvnw" ] && [ ! -f "$SERVICE_DIR/pom.xml" ]; then
    echo "❌ Aucun projet Maven détecté dans $SERVICE_DIR. Passage au suivant..."
    continue
  fi

  cd "$SERVICE_DIR" || { echo "❌ Impossible d'accéder à $SERVICE_DIR"; exit 1; }

  # Utilise le wrapper Maven si disponible
  if [ -f "./mvnw" ]; then
    ./mvnw test
  else
    mvn test
  fi

  # Vérification du succès des tests
  if [ $? -ne 0 ]; then
    echo "❌ Échec des tests pour [$SERVICE]. Arrêt du script."
    exit 1
  fi

  echo "✅ Tests réussis pour [$SERVICE]"

  # Revenir à la racine du projet
  cd - > /dev/null
done

echo ""
echo "🎉 Tous les tests ont été exécutés avec succès !"
