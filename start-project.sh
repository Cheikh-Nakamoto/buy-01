#!/bin/bash

# Couleurs pour les logs
GREEN='\033[0;32m'
NC='\033[0m' # No Color

launch_in_terminal() {
    local title="$1"
    local dir="$2"
    local command="$3"
    local terminal_type=$(detect_terminal)

    case $terminal_type in
        "gnome-terminal")
            gnome-terminal --tab --title="$title" --working-directory="$dir" \
                -- bash -c "echo -e '\033[0;32m${title}...\033[0m'; ${command}; \
                echo -e '\n\033[0;31mProcess terminé. Appuie sur Entrée pour fermer...\033[0m'; read" &
            ;;
        "xterm")
            xterm -T "$title" -hold -e "cd '$dir' && echo -e '\033[0;32m${title}...\033[0m' && ${command}" &
            ;;
        "konsole")
            konsole --new-tab --workdir "$dir" -p "TabTitle=$title" \
                -e bash -c "echo -e '\033[0;32m${title}...\033[0m' && ${command}" &
            ;;
        "osascript")
            osascript -e "tell application \"Terminal\" to do script \"cd '$dir' && echo -e '\\\\\\e[32m${title}...\\\\\\e[0m' && ${command}\"" &
            ;;
        "cmd")
            cmd.exe /c start cmd.exe /k "cd \"$(wslpath -w "$dir")\" && echo ${title}... && ${command}" &
            ;;
        *)
            echo -e "${YELLOW}⚠️ Terminal non supporté. Lancement en arrière-plan...${NC}"
            (cd "$dir" && ${command} &) || return 1
            ;;
    esac
}


echo -e "${GREEN}📦 Lancement du backend avec Docker Compose...${NC}"
./toggle-config.sh --inside
docker-compose up --build -d

# Attendre quelques secondes pour laisser le backend démarrer correctement
echo -e "${GREEN}⏳ Attente du démarrage du backend...${NC}"

sleep 80 # Pause pour laisser le temps au backend de démarrer

# Vérification que Docker a bien lancé les services
if ! docker ps | grep -q 'product-service'; then
  echo -e "${RED}❌ Erreur : Le backend ne semble pas démarré correctement.${NC}"
  exit 1
fi

# Aller dans le dossier du frontend (modifie cette ligne si besoin)
cd frontend || { echo "❌ Dossier 'frontend' introuvable."; exit 1; }

echo -e "${GREEN}🌐 Lancement du frontend Angular avec proxy...${NC}"
npm install
# 💡 Lancer typedoc dans un terminal séparé
launch_in_terminal "📘 Typedoc" "$PWD" "npm run serve-docs"

# 💡 Lancer Angular dans le terminal courant
npm start