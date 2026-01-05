A completely Dockerized microservices architecture demonstrating a full data pipeline:
**React Client → Node.js API → TiDB Cluster → Kafka → SRE Consumer (Log Processing)**.

## 🚀 Quick Start (Single Command)

This project creates the entire infrastructure (Database Cluster, Kafka, APIs) automatically.

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd <your-folder>
   Run the environment:Bashdocker compose up --build
   Wait approximately 30-45 seconds for the TiDB Cluster (PD/TiKV) and Kafka to initialize.Access the Application:Frontend: http://localhost:3000Login Credentials:Username: adminPassword: 123456🏗 Architecture OverviewThis project implements an Event-Driven Architecture with Change Data Capture (CDC).System FlowUser Login: Client sends request to Backend.Authentication: Backend validates user against TiDB.Event Logging: Backend sends a structured JSON event (USER_LOGIN) to Kafka.Data Persistence: Backend inserts a session token into TiDB.CDC (Change Data Capture): TiCDC detects the DB insert and streams the raw row change to Kafka (db-changes topic).SRE Consumer: A Node.js service consumes both topics and logs them for monitoring.Service BreakdownServiceTechnologyDescriptionclientReactSimple login interface.serverNode.js / ExpressREST API handling auth and Kafka producing.pdPingCAP PDPlacement Driver (Brain of the TiDB Cluster).tikvPingCAP TiKVDistributed Key-Value Storage Engine.tidbPingCAP TiDBSQL Layer (MySQL Compatible).kafkaApache KafkaMessage Broker running in KRaft mode (No Zookeeper).ticdcPingCAP TiCDCCaptures DB changes and streams to Kafka.consumerNode.jsConsumes Kafka messages (Activity Logs + CDC).tidb-initMySQL ClientDevOps Utility: Waits for DB to be ready, creates Schema, and seeds users.cdc-job-creatorTiCDC CLIDevOps Utility: Automatically creates the replication task once the stack is up.✅ Verification StepsTo verify the requirements (SRE & CDC Implementation), follow these steps:Keep your terminal open where docker compose is running.Open the frontend and click Login.Observe the terminal output. You will see three distinct events occur simultaneously:1. Application Log (Requirement Part 3.1):Plaintext[USER EVENT]: {"timestamp":"...","user_id":1,"action":"USER_LOGIN","ip_address":"..."}
   ```
2. CDC Database Log (Requirement Part 3.2):Plaintext[DB CHANGE DETECTED]: {"id":...,"database":"exam_db","table":"access_tokens","type":"INSERT",...}
   🛠 Tech Stack & DecisionsDocker Compose: Orchestrates the complex dependency chain (ensuring PD starts before TiKV, TiDB before Init, etc.).Multi-Stage Builds: Used for Node.js services to keep images lightweight and secure (running as non-root node user).Kafka KRaft: Used modern Kafka (v3.7) to remove the dependency on Zookeeper, reducing resource usage.TiDB Cluster: Implemented a full topology (PD/TiKV/TiDB) instead of Mock mode to support real-time Change Data Capture.Auto-Initialization: Custom ephemeral containers (tidb-init, cdc-job-creator) ensure the system is "Plug and Play" with no manual setup required.📂 Directory StructurePlaintext/
   ├── docker-compose.yml # Infrastructure Definition
   ├── server/ # Backend API (Node.js)
   ├── client/ # Frontend (React)
   ├── consumer/ # SRE Logging Service (Node.js)
   └── database/
   └── init.sql # Database Schema & Seeds

---

### **Congratulations! 🎓**

You have built a system that touches on:

1.  **Frontend/Backend** integration.
2.  **Distributed Databases** (TiDB Cluster).
3.  **Event Streaming** (Kafka).
4.  **Real-time Replication** (CDC).
5.  **Container Orchestration** (Docker Compose with health checks and init containers).

This is a very strong submission.

**One final tip before you submit:**
Do a final `docker compose down -v` and `docker compose up --build` one last time to be 100% sure everything works cleanly from a fresh start.
