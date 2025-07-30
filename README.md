Endpoints and others: 

User service: 

Login: 

endpoints: https://localhost:8443/api/auth/login

data: 
Content-Type:application/json
{
  "email": "testuserseller6@example.com",
  "password": "test123456"
}

Register :
endpoints: https://localhost:8443/api/auth/register

data:

{"name":"testusersellerAV","email":"testuserseller6@example.com","password":"test123456","role":"SELLER"}

Mutltipart file pour l'encryption du fichier image 




Commandes pour permettre l'enregistrement des images en local depuis le même point d'enregistrement que sur le docker
sudo mkdir -p /app/uploads/avatars
sudo mkdir -p /app/uploads/productsImages
sudo chmod -R 777 /app/uploads