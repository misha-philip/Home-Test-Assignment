# Home Test Assignment — Dockerized CDC Pipeline

A fully Dockerized microservices demo implementing a data pipeline:

**React client → Node.js API → TiDB Cluster → TiCDC → Kafka → SRE Consumer (log processing)**

## 🚀 Quick Start

1. Clone the repository and change directory:

```bash
git clone https://github.com/misha-philip/Home-Test-Assignment.git
cd Home-Test-Assignment
```

2. Start the full environment (build images and start services):

```bash
docker compose up --build
```

Note: Wait ~30–45 seconds for the TiDB cluster (PD/TiKV) and Kafka to initialize before using the app.

Frontend: http://localhost:3000

Default login credentials:

- Username: `admin`
- Password: `123456`

## Architecture Overview

This project demonstrates an event-driven architecture with Change Data Capture (CDC).

High-level flow:

- User logs in via the React client.
- The Node.js backend authenticates against TiDB and writes a session token to the `access_tokens` table.
- The backend publishes a structured event (e.g. `USER_LOGIN`) to Kafka.
- TiCDC captures the DB change and streams the raw row change to Kafka (topic: `db-changes`).
- The SRE consumer service consumes both the application events and CDC events for logging/monitoring.

## Services (what's included)

- `client` — React frontend (simple login UI).
- `server` — Node.js + Express API (auth logic, writes to TiDB, produces events to Kafka).
- `consumer` — Node.js service that consumes Kafka topics and logs events (SRE / monitoring).
- `tidb` / `pd` / `tikv` — TiDB cluster components (PD, TiKV, TiDB SQL layer).
- `kafka` — Apache Kafka (KRaft mode; no Zookeeper required).
- `ticdc` — TiCDC connector that streams DB row changes to Kafka.
- `tidb-init` — init container: waits for DB, creates schema, and seeds users.
- `cdc-job-creator` — helper container that creates the TiCDC replication task automatically.

## Verification / Expected Behavior

With `docker compose up --build` running and the frontend open, perform a login. You should observe three distinct outputs in the terminals/logs:

1. Application log (example):

```text
[USER EVENT]: {"timestamp":"...","user_id":1,"action":"USER_LOGIN","ip_address":"..."}
```

2. CDC database log (example):

```text
[DB CHANGE DETECTED]: {"id":...,"database":"exam_db","table":"access_tokens","type":"INSERT",...}
```

3. Consumer/SRE logs showing both activity logs and CDC messages consumed from Kafka.

## Tech Stack & Design Decisions

- Docker Compose: Orchestrates multi-container dependencies and ordered startups (PD → TiKV → TiDB → init tasks).
- Kafka (KRaft): Uses modern Kafka without Zookeeper (reduces resource footprint).
- TiDB Cluster: Real TiDB topology (PD/TiKV/TiDB) rather than a mock, enabling real-time CDC with TiCDC.
- Multi-stage Docker builds: Keeps Node.js images small and runs as a non-root `node` user where applicable.
- Auto-initialization: `tidb-init` and `cdc-job-creator` make the stack plug-and-play with no manual DB or CDC setup.

## Directory Structure

```
./
├── docker-compose.yml        # Infrastructure definition
├── server/                   # Backend API (Node.js)
├── client/                   # Frontend (React)
├── consumer/                 # SRE logging consumer (Node.js)
└── database/
    └── init.sql              # Schema & seed data
```

## Common Commands

- Start the stack:

```bash
docker compose up --build
```

- Stop and remove containers, networks, volumes (fresh start):

```bash
docker compose down -v
```

## Troubleshooting

- If TiDB components take longer to initialize, wait an additional 20–60 seconds and then re-run the login.
- If CDC replication task fails to create, check logs of the `cdc-job-creator` container and TiCDC service.
- Check Kafka topics with any Kafka client tooling; ensure both application events and `db-changes` topics exist.

## Notes for Reviewers

This project covers frontend/backend integration, a distributed database (TiDB), event streaming (Kafka), real-time replication via TiCDC, and container orchestration with Docker Compose. It is intentionally self-contained and automated for review convenience.
