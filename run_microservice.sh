#!/usr/bin/env bash

# Script pour lancer des microservices dans leurs propres terminaux
# Chaque service est lancé depuis son propre répertoire

# Configuration
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MICROSERVICES_DIR="${BASE_DIR}/backend/api"
DEFAULT_START_COMMAND="mvn spring-boot:run"
DELAY_BETWEEN_STARTS=10

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


# 🔧 Crée le réseau buy-network s’il n’existe pas
ensure_docker_network() {
    local network_name="$1"
    if ! docker network ls --format '{{.Name}}' | grep -q "^${network_name}$"; then
        echo -e "${YELLOW}🔌 Réseau ${network_name} absent. Création en cours...${NC}"
        docker network create "$network_name" > /dev/null
        echo -e "${GREEN}✅ Réseau ${network_name} créé avec succès${NC}"
    else
        echo -e "${GREEN}🔗 Réseau ${network_name} déjà présent${NC}"
    fi
}

# Lancer Mongo si nécessaire
start_mongo_container() {
    local name="$1"
    local db_name="$2"
    local port="$3"
    local volume="$4"
    local image="mongo:latest"

    echo -e "${BLUE}🛢️  Vérification du conteneur MongoDB: ${YELLOW}${name}${NC}"

    ensure_docker_image "$image"

    if docker ps -a --format '{{.Names}}' | grep -q "^${name}$"; then
        if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
            echo -e "${GREEN}✅ ${name} est déjà en cours d'exécution${NC}"
        else
            echo -e "${YELLOW}⏳ ${name} existe mais n'est pas en cours... Démarrage...${NC}"
            docker start "$name" > /dev/null
            echo -e "${GREEN}✅ ${name} démarré avec succès${NC}"
        fi
    else
        echo -e "${YELLOW}🚀 ${name} n'existe pas encore. Création et lancement...${NC}"

        # Crée le volume s'il n'existe pas (optionnel)
        if ! docker volume ls --format '{{.Name}}' | grep -q "^${volume}$"; then
            docker volume create "$volume" > /dev/null
            echo -e "${GREEN}📁 Volume ${volume} créé${NC}"
        fi

        docker run -d \
            --name "$name" \
            -e MONGO_INITDB_DATABASE="$db_name" \
            -e MONGO_INITDB_ROOT_USERNAME=root \
            -e MONGO_INITDB_ROOT_PASSWORD=secret \
            -p "$port:27017" \
            -v "${volume}:/data/db" \
            --network buy-network \
            "$image" > /dev/null

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ${name} lancé avec succès sur le port ${port}${NC}"
        else
            error_exit "❌ Échec du lancement de ${name}"
        fi
    fi
}

# Lancer Kafka et Zookeeper si nécessaire
start_kafka_stack() {
    local zk_name="zookeeper"
    local kafka_name="kafka"
    local zk_image="confluentinc/cp-zookeeper:latest"
    local kafka_image="confluentinc/cp-kafka:7.5.3"

    echo -e "${GREEN}🧩 Initialisation de Kafka et Zookeeper...${NC}"

    ensure_docker_image "$zk_image"
    ensure_docker_image "$kafka_image"

    # Zookeeper
    echo -e "${BLUE}🛢️  Vérification du conteneur Zookeeper: ${YELLOW}${zk_name}${NC}"
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${zk_name}$"; then
        echo -e "${YELLOW}🚀 Création et lancement de ${zk_name}...${NC}"
        docker run -d \
            --name "$zk_name" \
            -p 2181:2181 \
            -e ZOOKEEPER_CLIENT_PORT=2181 \
            -e ZOOKEEPER_TICK_TIME=2000 \
            --network buy-network \
            "$zk_image" > /dev/null
        echo -e "${GREEN}✅ ${zk_name} lancé avec succès${NC}"
    else
        docker start "$zk_name" > /dev/null
        echo -e "${GREEN}✅ ${zk_name} déjà existant et démarré${NC}"
    fi

    sleep 5 # On attend un peu que Zookeeper soit prêt

    # Kafka
    echo -e "${BLUE}🛢️  Vérification du conteneur Kafka: ${YELLOW}${kafka_name}${NC}"
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${kafka_name}$"; then
        echo -e "${YELLOW}🚀 Création et lancement de ${kafka_name}...${NC}"
        docker run -d \
            --name "$kafka_name" \
            -p 9092:9092 \
            -e KAFKA_BROKER_ID=1 \
            -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
            -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
            -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
            --network buy-network \
            "$kafka_image" > /dev/null
        echo -e "${GREEN}✅ ${kafka_name} lancé avec succès${NC}"
    else
        docker start "$kafka_name" > /dev/null
        echo -e "${GREEN}✅ ${kafka_name} déjà existant et démarré${NC}"
    fi
}

echo -e "${GREEN}🧩 Initialisation des bases MongoDB nécessaires...${NC}"

ensure_docker_network "buy-network"

start_mongo_container "user-mongodb" "user_db" 27017 "user_mongo_data"
start_mongo_container "product-mongodb" "product_db" 27018 "product_mongo_data"
start_mongo_container "media-mongodb" "media_db" 27019 "media_mongo_data"

start_kafka_stack

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

sleep 30 # Pause pour laisser le temps au backend de démarrer

# Aller dans le dossier du frontend (modifie cette ligne si besoin)
cd frontend || { echo "❌ Dossier 'frontend' introuvable."; exit 1; }

echo -e "${GREEN}🌐 Lancement du frontend Angular avec proxy...${NC}"
npm install
# 💡 Lancer typedoc dans un terminal séparé
launch_in_terminal "📘 Typedoc" "$PWD" "npm run serve-docs"

# 💡 Lancer Angular dans le terminal courant
npm start