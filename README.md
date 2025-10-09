# Office Calendar

A collaborative office calendar application built with **React + TypeScript**, **ASP.NET Core 8**, **SignalR**, and **SQL Server**, packaged with **Docker Compose** for easy development and deployment.

The project is organized as a monorepo with two main parts:

* **`web/`** → Frontend (React + Vite + TailwindCSS + FullCalendar + React Query)
* **`server/`** → Backend (ASP.NET Core, EF Core, SQL Server, SignalR)

---

## 🚀 Features

* Shared office calendar with event management
* Real-time updates via SignalR hubs
* SQL Server persistence using Entity Framework Core
* Authentication/authorization ready (JWT)
* Containerized dev environment (Docker Compose)

---

## 🏗️ Architecture

```
 ┌──────────────┐      REST / SignalR      ┌──────────────┐
 │   React UI   │  <-------------------->  │   ASP.NET    │
 │  (Vite + TS) │                          │   API + Hub  │
 └──────────────┘                          └──────────────┘
          │                                       │
          │                                       ▼
          │                              ┌────────────────┐
          │                              │   SQL Server   │
          │                              │ (EF Core ORM)  │
          │                              └────────────────┘
          │
          └──── Runs inside Docker Compose with hot reload
```

### Key choices

* **Vite + TailwindCSS** → lightweight, fast frontend dev
* **FullCalendar** → rich calendar UI integration
* **ASP.NET Core + EF Core** → reliable, strongly typed backend
* **SignalR** → real-time event updates across clients
* **SQL Server (Docker)** → enterprise-ready relational database
* **Docker Compose** → consistent local development on **Windows, macOS, Linux**

---

## ⚙️ Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS)
* [Docker Engine](https://docs.docker.com/engine/install/) (Linux)
* (Optional) [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download) and [Node.js 24+](https://nodejs.org/) for running outside Docker

---

## 🛠️ Installation & Running

Clone the repo:

```bash
git clone https://github.com/Sin0fGREED/WebDev-TeamPlaatshouder.git
cd WebDev-TeamPlaatshouder
```

Install/run Web for development (hotreload):

```bash
cd web
npm install
npm run dev
```

Build and watch dotnet for development (hotreload):
```bash
cd server
dotnet build

cd server/OfficeCalendar.Api
dotnet watch
```

### Run with Docker (recommended)

```bash
# build and start all containers (detached)
docker compose -f docker-compose.dev.yml up -d --build

# build db container (for dev)
docker compose -f docker-compose.dev.yml up -d db

# view logs
docker compose -f docker-compose.dev.yml logs -f

# shut down
docker compose -f docker-compose.dev.yml down
```

By default, the services will be available at:

* **Frontend (React):** [http://localhost:5173](http://localhost:5173)
* **Backend (API/SignalR):** [http://localhost:5287](http://localhost:5287)
* **Database (SQL Server):** localhost:1433

---

## 🔧 Development workflow

### Frontend (`web/`)

* Live reload is built in (via Vite). Changes to `.tsx`/`.css` are reflected instantly.
* To run outside Docker:

  ```bash
  cd web
  npm install
  npm run dev
  ```

### Backend (`server/`)

* EF Core handles migrations automatically when containers start.
* To add a new migration (outside Docker):

  ```bash
  cd server/src/OfficeCalendar.Infrastructure
  dotnet ef migrations add <Name> --startup-project ../OfficeCalendar.Api
  dotnet ef database update --startup-project ../OfficeCalendar.Api
  ```

### Database

* SQL Server runs inside a Docker container.
* Default credentials are configured in `server/src/OfficeCalendar.Api/appsettings.json`.
* Connect with any SQL client at `localhost:1433`.

---

## 🧪 Troubleshooting

* **SQL container slow / unhealthy** → check `docker logs oc_db` for errors (likely bad password or connection string mismatch).
* **CORS issues** → ensure API CORS policy allows `http://localhost:5173`.
* **SignalR not connecting** → verify the frontend URL matches the backend hub route `/hubs/calendar`.

---

## 📌 Next Steps

* Implement event validation & authentication flows
* Add CI/CD pipeline (GitHub Actions) for automated builds
* Deploy to production environment (Azure, AWS, etc.)

---
