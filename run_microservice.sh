#!/usr/bin/env bash

# Script pour lancer des microservices dans leurs propres terminaux
# Chaque service est lancé depuis son propre répertoire

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MICROSERVICES_DIR="${BASE_DIR}/backend/api"
DEFAULT_START_COMMAND="mvn spring-boot:run"
DELAY_BETWEEN_STARTS=1

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

# Appliquer la config outside avant de lancer les services
echo -e "${BLUE}🔧 Application de la configuration '--outside' avec toggle-config.sh...${NC}"
"${BASE_DIR}/toggle-config.sh" --outside || error_exit "Échec de la configuration avec toggle-config.sh"

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

# Lancer un microservice
launch_microservice() {
    local service_dir="$1"
    local service_name="$(basename "$service_dir")"
    local terminal_type=$(detect_terminal)
    local start_cmd="$DEFAULT_START_COMMAND"

    echo -e "${BLUE}📦 Traitement du service: ${YELLOW}${service_name}${NC}"
    echo -e "   📁 Répertoire: ${service_dir}"

    if [ ! -f "${service_dir}/pom.xml" ] && [ ! -f "${service_dir}/build.gradle" ]; then
        echo -e "${YELLOW}   ⚠️ Aucun projet Maven/Gradle détecté. Ignoré.${NC}"
        return 1
    fi

    # Choix du gestionnaire de build
    if [ -f "${service_dir}/pom.xml" ]; then
        start_cmd="mvn spring-boot:run"
    elif [ -f "${service_dir}/build.gradle" ]; then
        start_cmd="./gradlew bootRun"
    fi

    case $terminal_type in
        "gnome-terminal")
            gnome-terminal --tab --title="$service_name" --working-directory="$service_dir" \
                -- bash -c "echo -e '${GREEN}Démarrage de $service_name...${NC}'; ${start_cmd}; \
                echo -e '\n${RED}Service $service_name terminé. Appuyez sur Entrée pour fermer...${NC}'; read" &
            ;;
        "xterm")
            xterm -T "$service_name" -hold -e "cd '$service_dir' && echo -e '${GREEN}Démarrage de $service_name...${NC}' && ${start_cmd}" &
            ;;
        "konsole")
            konsole --new-tab --workdir "$service_dir" -p "TabTitle=$service_name" \
                -e bash -c "echo -e '${GREEN}Démarrage de $service_name...${NC}' && ${start_cmd}" &
            ;;
        "osascript")
            osascript -e "tell application \"Terminal\" to do script \"cd '$service_dir' && echo -e '\\\\\\e[32mDémarrage de $service_name...\\\\\\e[0m' && ${start_cmd}\"" &
            ;;
        "cmd")
            cmd.exe /c start cmd.exe /k "cd \"$(wslpath -w "$service_dir")\" && echo Démarrage de $service_name... && ${start_cmd}" &
            ;;
        *)
            echo -e "${YELLOW}   ⚠️ Terminal non supporté. Lancement en arrière-plan...${NC}"
            (cd "$service_dir" && ${start_cmd} &) || return 1
            ;;
    esac

    return 0
}

# Vérification initiale
echo -e "${GREEN}🚀 Préparation du lancement des microservices...${NC}"

if [ ! -d "$MICROSERVICES_DIR" ]; then
    error_exit "Le répertoire des microservices est introuvable : $MICROSERVICES_DIR"
fi

if ! command -v mvn &> /dev/null && ! command -v ./mvnw &> /dev/null; then
    error_exit "Maven n'est pas installé ou non accessible dans le PATH"
fi

# Gestion des arguments : services spécifiques
TARGET_SERVICES=()

if [ "$#" -gt 0 ]; then
    for arg in "$@"; do
        TARGET_SERVICES+=("$arg")
    done
else
    for service_path in "${MICROSERVICES_DIR}"/*; do
        [ -d "$service_path" ] && TARGET_SERVICES+=("$(basename "$service_path")")
    done
fi

# Lancer les services
services_launched=0

for service_name in "${TARGET_SERVICES[@]}"; do
    service_path="${MICROSERVICES_DIR}/${service_name}"
    if [ -d "$service_path" ]; then
        launch_microservice "$service_path" && ((services_launched++))
        sleep "$DELAY_BETWEEN_STARTS"
    else
        echo -e "${YELLOW}⚠️  Répertoire du service introuvable : $service_name${NC}"
    fi
done

# Résumé
if [ "$services_launched" -gt 0 ]; then
    echo -e "\n${GREEN}✅ ${services_launched} microservice(s) lancé(s) avec succès !${NC}"
else
    echo -e "\n${RED}❌ Aucun microservice valide n'a pu être lancé.${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Tous les services demandés ont été démarrés${NC}"
echo -e "${BLUE}ℹ️  Consulte les terminaux ouverts pour voir la sortie des services.${NC}"
