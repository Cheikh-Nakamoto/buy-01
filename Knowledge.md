Projet Buy01 - eCommerce

🧩 Microservices
├── user-service → inscription, authentification (Client / Seller), avatar
├── product-service → CRUD produits, images liées, accès Seller only
├── media-service → upload images (max 2MB), contrôle format, lien avec produits
🔗 Kafka → communication entre services (ex : event UserCreated, ProductCreated)
🛡️ Auth → Spring Security + JWT (rôle-based)
🧑‍💻 Frontend Angular → gestion utilisateurs, produits, média

| Service           | Dépendances principales                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `user-service`    | Spring Web, MongoDB, Security, Kafka, jjwt (auth), Validation                      |
| `product-service` | Spring Web, MongoDB, Security, Kafka, jjwt, Validation                             |
| `media-service`   | Spring Web, MongoDB, Security, Kafka, Validation, (Commons IO ou AWS SDK si cloud) |

- Ce qui est bien en place
  | Élément | Remarque |
  | ------------------------------------ | --------------------------------- |
  | ✅ `Spring Boot 3.5.3` | À jour, compatible avec Java 17 |
  | ✅ `spring-boot-starter-web` | API REST |
  | ✅ `spring-boot-starter-security` | Authentification et rôles |
  | ✅ `spring-boot-starter-data-mongodb` | Persistance NoSQL |
  | ✅ `spring-kafka` + test | Communication entre microservices |
  | ✅ `lombok` | Réduction du boilerplate |
  | ✅ `spring-boot-starter-test` | Couverture des tests unitaires |

- Les 3 services ont:

| Catégorie                    | user             | product            | media              |
| ---------------------------- | ---------------- | ------------------ | ------------------ |
| ✅ Web REST                  | ✔️               | ✔️                 | ✔️                 |
| ✅ MongoDB                   | ✔️               | ✔️                 | ✔️                 |
| ✅ Kafka                     | ✔️               | ✔️                 | ✔️                 |
| ✅ Security (Spring)         | ✔️               | ✔️                 | ✔️                 |
| 🔐 JWT (`jjwt`)              | ✔️ (obligatoire) | ➖ (lecture token) | ➖ (lecture token) |
| 🧪 Tests Kafka + Security    | ✔️               | ✔️                 | ✔️                 |
| 🔤 Validation                | ✔️               | ✔️                 | ✔️                 |
| 🖼 Commons IO (upload images) | ❌               | ❌                 | ✔️ (ajouter)       |
| 📚 Swagger                   | optionnel        | optionnel          | optionnel          |

-Services et rôles de services:

| Service           | Ce qu’il gère                                            |
| ----------------- | -------------------------------------------------------- |
| `user-service`    | Inscriptions, rôles, login, JWT, avatars                 |
| `product-service` | Produits CRUD (seller only), ownership, lien avec images |
| `media-service`   | Uploads d’images, vérification, liaison avec produits    |

Implémentation de Eureka dans une API à 2 microservices

               +-----------------+
               | Eureka Server   |
               +--------+--------+
                        ^
          +-------------+-------------+
          |                           |

+---------+--------+ +----------+----------+
| Service A (User) | <---> | Service B (Product) |
+------------------+ +---------------------+
^ ^
| |
+---+---+ +-----+----+
| Gateway |<------------->| Client UI |
+---------+ +----------+

      La particularité du serveur eureka, c'est de pouvoir communiquer entre microservices sans dépendre une addresse ip ou d'un port du service à contacter, on contacte simplement Eureka et lui se charge de rediriger les requêtes vers les bons services.

- Partie KAFKA

✅ Utilisation actuelle (minimale mais nécessaire)
Événement Producteur Consommateur(s) But
UserRegisteredEvent user-service product-service (ou autres) Préparer des relations, créer un profil, associer userId, etc.

C’est une bonne base pour découpler l’enregistrement utilisateur des autres services.

🧩 Autres cas où Kafka peut être utile dans le user-service

1. 🔄 Mise à jour du profil utilisateur
   Exemple : un SELLER modifie son nom ou son email → le product-service ou le media-service peut avoir besoin de cette info pour garder une cohérence d'affichage.

Événement : UserUpdatedEvent

Contenu : userId, newName, newEmail

Producteur : user-service

Consommateurs : product-service, media-service

2. ❌ Suppression d’un utilisateur
   Si tu veux gérer la suppression d’un compte :

Événement : UserDeletedEvent

Consommateurs : services qui ont des données liées à userId (produits, images, etc.)

Cela permet aux autres services de nettoyer les données liées.

3. 👮 Audit / Logging / Notifications
   Tu peux émettre des événements non métier :

UserLoggedInEvent → utilisé par un service d’audit ou de statistiques

UserBlockedEvent → pour désactiver d’autres ressources externes

UserChangedPasswordEvent → pour notifier ou logguer

4. 📧 Intégration avec un service d’email ou de notification
   Kafka peut transmettre à un service notification-service :

UserRegisteredEvent → envoie d’email de bienvenue

UserPasswordResetRequestedEvent → envoie du lien de réinitialisation

| Action dans user-service       | Kafka utile ?  | Pourquoi ?                                  |
| ------------------------------ | -------------- | ------------------------------------------- |
| Inscription (`register`)       | ✅ Obligatoire | Notifier les autres services (`userId`)     |
| Login (`login`)                | ⚠️ Optionnel   | Pour audit, pas obligatoire métier          |
| Modification profil (`update`) | ✅ Recommandé  | Si d’autres services utilisent le nom/email |
| Suppression (`delete user`)    | ✅ Recommandé  | Nettoyer les données dans d’autres services |
| Envoi d’e-mails                | ✅ Optionnel   | Découplé via `notification-service`         |

Structure globale avec utilisation du service gateway et discovery

buy-01/
├── discovery-server/          ← ✅ Eureka (port 8761)
├── gateway-service/           ← ✅ Spring Cloud Gateway + SSL (Let's Encrypt)
├── user-service/
├── product-service/
├── media-service/
└── docker-compose.yaml

🔧 Étape 1 – Générer le projet Spring Boot Eureka
Va sur https://start.spring.io et configure :

Champ	Valeur
Project	Maven
Language	Java
Spring Boot version	3.2.x ou 3.1.x
Group	com.example
Artifact	discovery-server
Name	discovery-server
Package name	com.example.discoveryserver
Packaging	Jar
Java	17
✅ Dependencies	Spring Boot DevTools, Eureka Server

Tu peux aussi ajouter Spring Web si tu veux personnaliser les réponses plus tard (optionnel).

📁 Étape 2 – Activer Eureka Server dans l’application
Dans DiscoveryServerApplication.java :

java
Copier
Modifier
package com.example.discoveryserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
🧾 Étape 3 – Configurer application.yml (ou .properties)
Dans src/main/resources/application.yml :

yaml
Copier
Modifier
server:
  port: 8761

spring:
  application:
    name: discovery-server

eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
Ici, le serveur n’enregistre pas lui-même de services (il est le point central).

🛠 Étape 4 – Lancer le projet
Compile et lance :

bash
Copier
Modifier
./mvnw spring-boot:run
Puis ouvre :

http://localhost:8761
Tu verras : ✅ Eureka Dashboard avec 0 service disponible.

✅ Étape 1 – Générer le projet gateway-service
Utilise https://start.spring.io :

Champ	Valeur
Group	com.example
Artifact	gateway-service
Java	17
Spring Boot	3.2.x
✅ Dépendances	✅ Spring Cloud Gateway
✅ Eureka Discovery Client
✅ Spring Boot DevTools

✅ Étape 2 – Configuration de base application.yml
Dans src/main/resources/application.yml :

yaml
Copier
Modifier
server:
  port: 8080

spring:
  application:
    name: gateway-service

  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**

eureka:
  client:
    service-url:
      defaultZone: http://discovery-server:8761/eureka
📌 Ici :

lb://user-service : Spring utilise Eureka pour faire du load balancing

Path=/api/users/** : tout ce qui commence par /api/users est redirigé vers user-service

✅ Étape 3 – Activer Eureka dans GatewayApplication.java
java
Copier
Modifier
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
✅ Étape 4 – Dockeriser le Gateway
📄 Dockerfile :
dockerfile
Copier
Modifier
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY target/gateway-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
✅ Étape 5 – Ajouter au docker-compose.yaml
yaml
Copier
Modifier
  gateway-service:
    build: ./gateway-service
    container_name: gateway-service
    ports:
      - "8080:8080"
    depends_on:
      - discovery-server
      - user-service
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-server:8761/eureka
✅ Étape 6 – Test avec Postman ou navigateur
Accède à :

bash
Copier
Modifier
http://localhost:8080/api/users/me
📌 Cela va :

Passer par le Gateway

Aller vers Eureka

Rediriger vers user-service en interne

🛡️ Est-ce que la sécurité doit être implémentée au niveau du Gateway ?
✅ Oui, en grande partie. Le Gateway est le meilleur endroit pour centraliser la sécurité externe, mais pas le seul.

🎯 Voici comment répartir la sécurité dans une architecture microservices avec Spring Cloud Gateway + Eureka
1. 🔐 Au niveau du Gateway (gateway-service) — Filtrage global
À mettre ici :
Sécurité	Pourquoi ?
✅ Vérification du JWT	Toutes les requêtes passent ici : 1 seul point de contrôle
✅ CORS	Pour autoriser ou bloquer des appels depuis le frontend
✅ Redirection HTTP → HTTPS	SSL = obligatoire ici uniquement
✅ Rate limiting / Throttling	Empêcher les abus ou attaques DoS côté public
✅ IP whitelisting / Firewall	Protection de base avant d’entrer dans les services

💡 Tu peux utiliser un GlobalFilter dans Spring Cloud Gateway pour tout ça.

2. 🔐 Au niveau des services (user, product, media) — Sécurité métier
À maintenir ici :
Sécurité / Authz	Pourquoi ?
✅ @PreAuthorize("hasRole('SELLER')")	Seul un vendeur peut créer un produit
✅ Protection des endpoints sensibles	Même si le JWT a été validé au Gateway, on revérifie
✅ Isolation des rôles par service	user-service ne connaît pas product-service

✅ Ces services doivent faire confiance au JWT vérifié en amont, mais garder une logique métier propre à eux.

📊 Exemple concret de répartition
Élément	Implémenté dans…	Exemple
Vérification du token JWT	🔐 Gateway	GlobalFilter qui rejette un token invalide
Empêcher un CLIENT d’ajouter produit	🧠 product-service	@PreAuthorize("hasRole('SELLER')")
Bloquer des IP anonymes	🔐 Gateway	Config dans application.yml ou plugin de sécurité
Expiration de session utilisateur	🔐 Gateway	Décodage du JWT (exp claim)
Cacher les endpoints admin	🧠 user-service (ou Gateway)	Route avec roles ou route privée

🧠 Règle d’or
🧰 Le Gateway sécurise l’entrée du système (contrôle d’accès global)

🧱 Les microservices sécurisent leur logique métier spécifique

Résumé de la configuration nécessaire
Élément	Fichier	Ajout requis
JWT	application.yml	jwt.secret
CORS	Spring config Java	OK ✅
RateLimiter	Java avec Bucket4j	OK ✅ (name() = RateLimiter)
Routes Gateway	application.yml	spring.cloud.gateway.routes[...]
Eureka client	application.yml	spring.application.name + eureka.client
Dépendances Maven	pom.xml	✅ Doit inclure spring-cloud-starter-gateway, eureka-client, jjwt-api, bucket4j-core, etc.

💡 À vérifier :
✅ Ton filtre JwtAuthFilter est un GlobalFilter, donc tu n'as pas besoin de le référencer dans le YAML : il s'applique automatiquement à toutes les routes non publiques (via ton isPublicEndpoint).

✅ RateLimiter est bien un GatewayFilterFactory, donc tu dois l’appeler par name: dans chaque route que tu veux limiter (comme ci-dessus sur /api/auth/**).

❗ Important
Ta jwt.secret doit faire au moins 32 caractères pour être compatible avec hmacShaKeyFor.

Si tu veux que RateLimiter s'applique uniquement sur /api/auth/login, garde cette logique dans ta classe, tu n’as pas besoin de définir plus dans le YAML.




------ TAF

Traitement de chaque services pour un bon fonctionnement :

User service In progress...

passerelle gateway à mettre en place pour permettre la communication entre les micros-services ...

Eureka à étudier pour comprendre l'utilité et l'implémentation
