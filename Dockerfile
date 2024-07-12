# Use a imagem base do nginx
FROM nginx:alpine

# # Remova o arquivo de configuração padrão do nginx
# RUN rm /etc/nginx/conf.d/default.conf

# Adicione uma nova configuração do nginx
COPY Web/nginx.conf /etc/nginx/conf.d

# Copie o arquivo index.html para o diretório padrão do nginx
COPY Web/index.html /usr/share/nginx/html
COPY Web/login.html /usr/share/nginx/html
COPY Web/scripts.js /usr/share/nginx/html
COPY Web/login.js /usr/share/nginx/html
COPY Web/styles.css /usr/share/nginx/html
COPY Web/edit.png /usr/share/nginx/html

# Exponha a porta 80
EXPOSE 80