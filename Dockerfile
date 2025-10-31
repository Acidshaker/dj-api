# Imagen base ligera con Node.js
FROM node:22-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Da permisos al script de arranque
RUN chmod +x entrypoint.sh

# Compila el proyecto TypeScript
RUN npm run build

# Establece el script como punto de entrada
ENTRYPOINT ["sh", "./entrypoint.sh"]
