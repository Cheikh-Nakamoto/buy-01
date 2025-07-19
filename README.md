# buy-01

🔐 Endpoints du user-service
Voici la liste des endpoints selon ce que tu m’as montré jusque-là, structurée par logique :

🔐 Authentification (/api/auth)
Méthode	URL	Description	Auth requise
POST	/api/auth/register	Créer un utilisateur (SELLER ou CLIENT), avec (ou sans) avatar	❌ Non
POST	/api/auth/login	Authentification, retourne JWT	❌ Non

👤 Utilisateur (/api/users)
Méthode	URL	Description	Auth requise
GET	/api/users/me	Récupérer le profil de l'utilisateur connecté	✅ Oui (JWT)
PUT	/api/users/avatar	Mettre à jour l'avatar de l'utilisateur (SELLER)	✅ Oui (JWT)
PUT	/api/users/me	Modifier son profil	✅ Oui
DELETE	/api/users/me	Supprimer son compte (et déclencher l’événement Kafka)	✅ Oui

🔒 Admin (si implémenté plus tard)
Méthode	URL	Description	Auth requise
GET	/api/admin/users	Lister tous les utilisateurs	✅ Role ADMIN
DELETE	/api/admin/users/{id}	Supprimer un utilisateur spécifique	✅ Role ADMIN