# Etapa 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/clientapp-react
COPY clientapp-react/package.json clientapp-react/package-lock.json ./
RUN npm install
COPY clientapp-react/ ./
RUN npm run build

# Etapa 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY TangoKultura.csproj ./
COPY TangoKultura.sln ./
COPY appsettings.json ./
COPY appsettings.Development.json ./
COPY Controllers/ ./Controllers/
COPY Data/ ./Data/
COPY Helpers/ ./Helpers/
COPY Migrations/ ./Migrations/
COPY Models/ ./Models/
COPY Properties/ ./Properties/
COPY Views/ ./Views/
COPY wwwroot/ ./wwwroot/
COPY Program.cs ./
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# Etapa 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
# Copia el build de React al wwwroot FINAL (después del publish)
COPY --from=frontend-build /app/clientapp-react/build ./wwwroot
ENV ASPNETCORE_URLS=https://+:8080;http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TangoKultura.dll"]
