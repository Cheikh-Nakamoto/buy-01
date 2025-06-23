Projet Buy01 - eCommerce

🧩 Microservices
├── user-service      → inscription, authentification (Client / Seller), avatar
├── product-service   → CRUD produits, images liées, accès Seller only
├── media-service     → upload images (max 2MB), contrôle format, lien avec produits
🔗 Kafka              → communication entre services (ex : event UserCreated, ProductCreated)
🛡️ Auth              → Spring Security + JWT (rôle-based)
🧑‍💻 Frontend Angular → gestion utilisateurs, produits, média


| Service           | Dépendances principales                                                            |
| ----------------- | ---------------------------------------------------------------------------------- |
| `user-service`    | Spring Web, MongoDB, Security, Kafka, jjwt (auth), Validation                      |
| `product-service` | Spring Web, MongoDB, Security, Kafka, jjwt, Validation                             |
| `media-service`   | Spring Web, MongoDB, Security, Kafka, Validation, (Commons IO ou AWS SDK si cloud) |

- Ce qui est bien en place
| Élément                              | Remarque                          |
| ------------------------------------ | --------------------------------- |
| ✅ `Spring Boot 3.5.3`                | À jour, compatible avec Java 17   |
| ✅ `spring-boot-starter-web`          | API REST                          |
| ✅ `spring-boot-starter-security`     | Authentification et rôles         |
| ✅ `spring-boot-starter-data-mongodb` | Persistance NoSQL                 |
| ✅ `spring-kafka` + test              | Communication entre microservices |
| ✅ `lombok`                           | Réduction du boilerplate          |
| ✅ `spring-boot-starter-test`         | Couverture des tests unitaires    |

- Les 3 services ont:

| Catégorie                     | user             | product           | media             |
| ----------------------------- | ---------------- | ----------------- | ----------------- |
| ✅ Web REST                    | ✔️               | ✔️                | ✔️                |
| ✅ MongoDB                     | ✔️               | ✔️                | ✔️                |
| ✅ Kafka                       | ✔️               | ✔️                | ✔️                |
| ✅ Security (Spring)           | ✔️               | ✔️                | ✔️                |
| 🔐 JWT (`jjwt`)               | ✔️ (obligatoire) | ➖ (lecture token) | ➖ (lecture token) |
| 🧪 Tests Kafka + Security     | ✔️               | ✔️                | ✔️                |
| 🔤 Validation                 | ✔️               | ✔️                | ✔️                |
| 🖼 Commons IO (upload images) | ❌                | ❌                 | ✔️ (ajouter)      |
| 📚 Swagger                    | optionnel        | optionnel         | optionnel         |

-Services et rôles de services:

| Service           | Ce qu’il gère                                            |
| ----------------- | -------------------------------------------------------- |
| `user-service`    | Inscriptions, rôles, login, JWT, avatars                 |
| `product-service` | Produits CRUD (seller only), ownership, lien avec images |
| `media-service`   | Uploads d’images, vérification, liaison avec produits    |


------ TAF 

Traitement de chaque services pour un bon focntionnement 

Dossier gateway à mettre en place pour permettre la communication entre les micros-services ... 

Eureka à étudier pour comprendre l'utilité et l'implémentation