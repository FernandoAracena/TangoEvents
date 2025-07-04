# Etapa 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/clientapp-react

# Copia solo los archivos de manifiesto primero
COPY clientapp-react/package.json ./

# Instala dependencias
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install

# Copia el resto del código fuente
COPY clientapp-react/ ./

# Construye la aplicación
RUN npm run build

# Etapa 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar todos los archivos del proyecto
COPY . .

# Publicar la aplicación directamente
RUN dotnet publish "TangoKultura.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Copia el build de React al wwwroot FINAL (después del publish)
COPY --from=frontend-build /app/clientapp-react/build ./wwwroot
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TangoKultura.dll"]