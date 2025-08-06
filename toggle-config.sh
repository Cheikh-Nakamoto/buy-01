#!/bin/bash

# Liste des services
SERVICES=("user" "product" "media")
BASE_DIR="backend/api"

# Fonctions utilitaires
comment_lines() {
  sed -i "/$1/{n; s/^[^#]/#&/; n; s/^[^#]/#&/; n; s/^[^#]/#&/;}" "$2"
}

uncomment_lines() {
  sed -i "/$1/{n; s/^#//; n; s/^#//; n; s/^#//;}" "$2"
}

detect_mode() {
  local file="$1"
  local line
  line=$(sed -n '/#Connection in Inside/{n; p;}' "$file")
  if [[ "$line" =~ ^# ]]; then
    echo "outside"
  else
    echo "inside"
  fi
}

# Déterminer le mode à appliquer
MODE="$1"
if [[ -z "$MODE" || "$MODE" == "--toggle" ]]; then
  MODE="--toggle"
fi

# Traitement pour chaque service
for SERVICE in "${SERVICES[@]}"; do
  FILE="$BASE_DIR/$SERVICE/src/main/resources/application.properties"

  if [ ! -f "$FILE" ]; then
    echo "❌ Fichier introuvable pour $SERVICE : $FILE"
    continue
  fi

  CURRENT_MODE=$(detect_mode "$FILE")
  TARGET_MODE="$MODE"

  # Si mode auto, basculer
  if [[ "$MODE" == "--toggle" ]]; then
    if [ "$CURRENT_MODE" == "inside" ]; then
      TARGET_MODE="--outside"
    else
      TARGET_MODE="--inside"
    fi
  fi

  echo "🔧 [$SERVICE] Configuration actuelle : $CURRENT_MODE → Nouvelle : ${TARGET_MODE/--/}"

  if [[ "$TARGET_MODE" == "--inside" ]]; then
    uncomment_lines "#Connection in Inside" "$FILE"
    comment_lines "#Connection in Outside" "$FILE"
  elif [[ "$TARGET_MODE" == "--outside" ]]; then
    uncomment_lines "#Connection in Outside" "$FILE"
    comment_lines "#Connection in Inside" "$FILE"
  else
    echo "❌ Mode invalide : $MODE"
    exit 1
  fi

  echo "✅ [$SERVICE] Mise à jour effectuée"
done

echo "🎉 Tous les fichiers traités avec succès."
