# Étape 1 : Utiliser une image Maven pour construire le projet
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Étape 2 : Utiliser une image JDK légère pour exécuter l'app
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Port exposé (doit correspondre à server.port)
EXPOSE 8083

# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]
