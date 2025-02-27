# 🌐 Weave - Social Accounts on Prism

A decentralized platform for managing and securing social media accounts using blockchain technology and zero-knowledge proofs.

## 🌟 Overview

Weave is a Web3 application that allows users to securely manage their social media accounts using blockchain technology. It combines the power of Prism protocol for account verification with a modern web interface for seamless user experience.

## 🏗️ Architecture

The project consists of two main components:

### Frontend (Client)

- Built with React + Vite
- Uses TanStack Router for routing
- Integrates with Cosmos Kit for wallet connections
- Modern UI with Tailwind CSS
- TypeScript for type safety

### Backend (Server)

- Written in Rust
- Uses Axum web framework
- Integrates with Prism protocol
- MySQL database with Diesel ORM
- JWT-based authentication

## 📁 Folder Structure

```
root/
├── client/    # Frontend React application
│   ├── src/   # Source code for the frontend
│   │   ├── assets/      # Static files and images
│   │   ├── components/  # Reusable React components
│   │   ├── config/      # Configuration files
│   │   ├── contexts/    # React context providers
│   │   ├── hooks/       # Custom React hooks
│   │   ├── routes/      # Application routes
│   │   ├── services/    # API and other services
│   │   ├── utils/       # Helper functions
│   │   ├── main.tsx     # Entry point
│   │   └── input.css    # Global styles
│   ├── public/          # Static assets
│   ├── vite.config.ts   # Vite configuration
│   └── package.json     # Frontend dependencies
├── server/    # Backend Rust application
│   ├── src/   # Source code for the backend
│   │   ├── api/         # API routes and handlers
│   │   ├── config/      # Server configuration
│   │   ├── domain/      # Business logic
│   │   ├── entities/    # Database models
│   │   ├── middleware/  # Custom middleware
│   │   ├── services/    # Business services
│   │   ├── utils/       # Helper functions
│   │   ├── main.rs      # Entry point
│   │   └── schema.rs    # Database schema
│   ├── migrations/      # Database migrations
│   ├── Cargo.toml       # Rust dependencies
│   └── README.md        # Backend details
└── README.md  # Project documentation
```

## 📋 Prerequisites

- Node.js (for frontend)
- Rust (for backend)
- MySQL 8.0
- Docker and Docker Compose (for containerized deployment)

## 🚀 Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd weave
```

### Frontend Setup

```bash
cd client
yarn install
yarn dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Install MySQL:

```bash
brew install mysql@8.0
```

2. Update your path (add to ~/.zshrc):

```bash
export PATH="$(brew --prefix mysql-client)/bin:$PATH"
```

3. Install Diesel CLI:

```bash
cargo install diesel_cli --no-default-features --features mysql
```

4. Setup the database:

```bash
cd server
diesel setup
make up-migraitons
```

5. Run the server:

```bash
cargo run
```

The backend will be available at `http://localhost:8080`

### Database Setup and Management

#### Initial Setup

1. Install MySQL locally:

```bash
brew install mysql@8.0
```

2. Update your path (add to ~/.zshrc):

```bash
export PATH="$(brew --prefix mysql-client)/bin:$PATH"
```

3. Install Diesel CLI:

```bash
cargo install diesel_cli --no-default-features --features mysql
```

#### Database Operations

1. Setup database with Diesel:

```bash
diesel setup
```

2. Run existing migrations:

```bash
make up-migraitons
```

3. Create a new migration:

```bash
make new-migraiton
```

4. Revert last migration:

```bash
make down-migraitons
```

#### Docker Operations

```bash
# Build and start all services
make build

# Start all services in detached mode
make up

# Start only the database
make up-db

# Stop all services
make down

# View logs
make logs

# Check running containers
make ps
```

#### Working with Docker

If you're using Docker, the database will be automatically set up with the following credentials:

- Database: `mydatabase`
- User: `myuser`
- Password: `mypassword`
- Root Password: `rootpassword`
- Port: `3306`

## 🛠️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- TanStack Router
- Cosmos Kit
- Tailwind CSS
- Heroicons
- Framer Motion

### Backend

- Rust
- Axum
- Diesel ORM
- MySQL
- Prism Protocol
- JWT Authentication

## 🔧 Development

### Available Commands

Frontend:

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn preview      # Preview production build
yarn lint         # Run linter
```

Backend:

```bash
cargo run        # Run the server
cargo test       # Run tests
cargo build      # Build the project
```

## 🌐 API Routes

### Public Routes

- `POST /auth/prepare` - Prepare authentication data
- `POST /auth` - Authenticate wallet
- `POST /auth/refresh` - Refresh authentication tokens
- `POST /proof-stats` - Get proof statistics

### Protected Routes

- `POST /proof/prepare` - Prepare proof data
- `POST /proof` - Apply proof

## 🚀 Future Plans

### SDK Development

We are actively working on developing a comprehensive SDK (Software Development Kit) that will allow developers to easily integrate Weave's functionality into their own applications. The SDK will include:

- **JavaScript/TypeScript Library**: For web and Node.js applications
- **Rust Crate**: For backend integrations

The SDK will provide:

- Simple authentication with social accounts
- Verification of social media ownership
- Access to user statistics and analytics
- Webhook integrations for real-time updates
- Customizable UI components

Our goal is to make social account verification a standard feature that any application can implement with minimal effort, enhancing security and trust across the web3 ecosystem.

Stay tuned for updates on our SDK development progress!

## 👥 About Us

We are a team of software engineers specializing in Web3 development, with a focus on:

- Building high-load, scalable solutions
- Expertise in fintech and cybersecurity
- Passion for decentralization and user empowerment
- Commitment to blockchain technology innovation

## 🔒 Security

- JWT-based authentication
- Secure wallet connections
- Zero-knowledge proofs for account verification
- CORS protection
- Environment-based configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ by the Weave Team
`diesel migration generate migraiton_name`

## Deployment steps

gcloud auth login
gcloud auth application-default login
gcloud config set project prism-accounts

ssh root@159.223.29.217

1. Update the server:

apt update && apt upgrade -y 2. Install Docker and Docker Compose:

apt install docker.io docker-compose -y
systemctl start docker
systemctl enable docker

adduser dima
usermod -aG docker dima

su - dima
sync project

scp -r ~/Documents/Projects/my-projects/twitter-acc-prism/client dima@159.223.29.217:/app
scp -r ~/Documents/Projects/my-projects/twitter-acc-prism/server dima@159.223.29.217:/app
scp -r ~/Documents/Projects/my-projects/twitter-acc-prism/docker-compose.yml dima@159.223.29.217:/app

http://159.223.29.217:8080/

https://www.duckdns.org/
http://prism-accounts.duckdns.org

sudo systemctl stop nginx

test nginx config

`nginx -t`

docker network

create
`docker network create mynetwork`

ssl certificates

docker exec -it <nginx-container-id> sh

certbot --nginx -d weavefg.com -d www.weavefg.com
certbot --nginx -d prism-accounts.duckdns.org

echo "0 0 \* \* \* certbot renew --quiet && nginx -s reload" >> /etc/crontabs/root
