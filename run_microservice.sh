#!/usr/bin/env bash

# Script pour lancer des microservices dans leurs propres terminaux
# Chaque service est lancé depuis son propre répertoire

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MICROSERVICES_DIR="${BASE_DIR}/backend/api"  # Chemin relatif depuis l'emplacement du script
START_COMMAND="mvn spring-boot:run"         # Commande pour démarrer chaque service
DELAY_BETWEEN_STARTS=1                      # Délai entre les lancements en secondes

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'erreur
error_exit() {
    echo -e "${RED}❌ Erreur: $1${NC}" >&2
    exit 1
}

# Vérification initiale
echo -e "${GREEN}🚀 Préparation du lancement des microservices...${NC}"

# Vérifier que le répertoire des microservices existe
if [ ! -d "$MICROSERVICES_DIR" ]; then
    error_exit "Le répertoire des microservices n'existe pas: $MICROSERVICES_DIR"
fi

# Vérifier que Maven est installé
if ! command -v mvn &> /dev/null; then
    error_exit "Maven (mvn) n'est pas installé ou n'est pas dans le PATH"
fi

# Détection du terminal
detect_terminal() {
    case "$OSTYPE" in
        linux*)
            if command -v gnome-terminal &> /dev/null; then
                echo "gnome-terminal"
            elif command -v konsole &> /dev/null; then
                echo "konsole"
            elif command -v xterm &> /dev/null; then
                echo "xterm"
            else
                echo "unknown"
            fi
            ;;
        darwin*)
            echo "osascript"
            ;;
        cygwin*|msys*|win32*)
            if command -v cmd.exe &> /dev/null; then
                echo "cmd"
            else
                echo "unknown"
            fi
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Lancement d'un microservice
launch_microservice() {
    local service_dir="$1"
    local service_name="$(basename "$service_dir")"
    local terminal_type=$(detect_terminal)
    
    echo -e "${BLUE}📦 Traitement du service: ${YELLOW}${service_name}${NC}"
    echo -e "   📁 Répertoire: ${service_dir}"

    if [ ! -f "${service_dir}/pom.xml" ] && [ ! -f "${service_dir}/build.gradle" ]; then
        echo -e "${YELLOW}   ⚠️  Avertissement: Aucun fichier de build détecté, ignoré${NC}"
        return 1
    fi

    case $terminal_type in
        "gnome-terminal")
            gnome-terminal --tab --title="$service_name" --working-directory="$service_dir" \
                -- bash -c "echo -e '${GREEN}Démarrage de $service_name...${NC}'; ${START_COMMAND}; \
                echo -e '\n${RED}Service $service_name terminé. Appuyez sur Entrée pour fermer...${NC}'; read" &
            ;;
        "xterm")
            xterm -T "$service_name" -hold -e "cd '$service_dir' && \
                echo -e '${GREEN}Démarrage de $service_name...${NC}' && ${START_COMMAND}" &
            ;;
        "konsole")
            konsole --new-tab --workdir "$service_dir" -p "TabTitle=$service_name" \
                -e bash -c "echo -e '${GREEN}Démarrage de $service_name...${NC}' && ${START_COMMAND}" &
            ;;
        "osascript")
            osascript -e "tell application \"Terminal\" to do script \"cd '$service_dir' && \
                echo -e '\\\\\\e[32mDémarrage de $service_name...\\\\\\e[0m' && ${START_COMMAND}\"" &
            ;;
        "cmd")
            cmd.exe /c start cmd.exe /k "cd \"$(wslpath -w "$service_dir")\" && \
                echo Démarrage de $service_name... && ${START_COMMAND}" &
            ;;
        *)
            echo -e "${YELLOW}   ⚠️  Terminal non supporté. Lancement en arrière-plan dans le répertoire...${NC}"
            (cd "$service_dir" && ${START_COMMAND} &)
            ;;
    esac

    return 0
}

# Main execution
echo -e "${GREEN}🔍 Recherche des microservices dans: ${MICROSERVICES_DIR}${NC}"

services_launched=0
for service_dir in "${MICROSERVICES_DIR}"/*; do
    if [ -d "$service_dir" ]; then
        launch_microservice "$service_dir" && ((services_launched++))
        sleep "$DELAY_BETWEEN_STARTS"  # Petit délai entre les lancements
    fi
done

# Résumé
if [ "$services_launched" -gt 0 ]; then
    echo -e "\n${GREEN}✅ ${services_launched} microservice(s) lancé(s) avec succès!${NC}"
else
    echo -e "\n${RED}❌ Aucun microservice valide trouvé à lancer${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Tous les services ont été démarrés${NC}"
echo -e "${BLUE}ℹ️  Vérifiez les terminaux ouverts pour voir les sorties des services${NC}"