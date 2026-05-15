FROM node:22-alpine AS build

# Cria diretório de trabalho
WORKDIR /app

# Copia os arquivos de configurações/dependências e as instala
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Expõe a porta
EXPOSE 3001

# Executa
CMD ["npm", "run", "dev"]