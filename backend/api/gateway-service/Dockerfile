# Étape 1 : Construction du JAR avec Maven
FROM maven:3.9.4-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier tous les fichiers du projet
COPY . .

# Construction du JAR (skip les tests pour accélérer)
RUN mvn clean package -DskipTests

# Étape 2 : Image d'exécution avec JDK 17 léger
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copier uniquement le JAR construit depuis l'étape précédente
COPY --from=builder /app/target/*.jar app.jar

# Port d'exposition du service gateway
EXPOSE 8090

# Commande de lancement
ENTRYPOINT ["java", "-jar", "app.jar"]
