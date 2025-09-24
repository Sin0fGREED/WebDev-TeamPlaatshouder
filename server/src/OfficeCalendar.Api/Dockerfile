# ---------- Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# copy sln and csproj for restore (paths relative to context: ./server)
COPY OfficeCalendar.sln ./
COPY src/OfficeCalendar.Domain/OfficeCalendar.Domain.csproj ./src/OfficeCalendar.Domain/
COPY src/OfficeCalendar.Application/OfficeCalendar.Application.csproj ./src/OfficeCalendar.Application/
COPY src/OfficeCalendar.Infrastructure/OfficeCalendar.Infrastructure.csproj ./src/OfficeCalendar.Infrastructure/
COPY src/OfficeCalendar.Api/OfficeCalendar.Api.csproj ./src/OfficeCalendar.Api/

RUN dotnet restore ./src/OfficeCalendar.Api/OfficeCalendar.Api.csproj

# copy all source and publish
COPY src ./src
RUN dotnet publish ./src/OfficeCalendar.Api/OfficeCalendar.Api.csproj -c Release -o /app/publish

# ---------- Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "OfficeCalendar.Api.dll"]
