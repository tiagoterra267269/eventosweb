# EventosWeb
SPA composto que auxilia a gestão de eventos (encontros de estudos, workshops).

# Pré-requisitos
A aplicação se integra com a aplicação projeto eventosapi que é responsável por fornecer os dados que o **EventosWeb** e com o projeto **controledeacesso** 
responsável por permitir o acesso do usuário à aplicação.

Crie a imagem do docker referente ao projeto controle de acesso:
>  docker build -t eventosapi .

Crie a rede, caso nao exista:

docker network create mvp_network

Execute os containers conforme abaixo:

> docker run -d --name controledeacessoapi --network mvp_network -p 5000:5000 controledeacessoapi

> docker run -d --name eventos-web --network mvp_network -p 8080:80 eventos-web

> docker run -d --name eventosapi --network mvp_network -p 5001:5001 eventosapi

# Autores
Tiago Terra
