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

------ TAF

Traitement de chaque services pour un bon fonctionnement :

User service In progress...

Dossier gateway à mettre en place pour permettre la communication entre les micros-services ...

Eureka à étudier pour comprendre l'utilité et l'implémentation
