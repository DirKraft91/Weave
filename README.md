# Project Name 

Weave - Social accounts on Prism

## Overview  

---

## Folder Structure  

```
root/
├── client/    # Frontend React application
│   ├── src/   # Source code for the frontend
│   ├── public/ # Static assets
│   ├── vite.config.ts # Vite configuration
│   └── package.json  # Frontend dependencies
├── server/    # Backend Rust application
│   ├── src/   # Source code for the backend
│   ├── Cargo.toml  # Rust dependencies
│   └── README.md  # Backend-specific details
└── README.md  # Project documentation
```

---

## Prerequisites  

Ensure the following tools are installed:  
- **Node.js** (for the frontend)  
- **yarn** (for managing frontend dependencies)  
- **Rust** (for the backend, using Cargo as the package manager)  

---

## Installation  

### 1. Clone the repository  

```bash  
git clone <repository_url>  
cd <repository_name>  
```  

### 2. Install Dependencies  

#### Frontend (Client)  

Navigate to the `client` directory:  

```bash  
cd client  
yarn install  
```  

#### Backend (Server)  

Navigate to the `server` directory:  

```bash  
cd server  
cargo build  
```  

---

## Running the Application  

### Start the Frontend  

From the `client` directory:  

```bash  
yarn run dev  
```  

This will start the Vite development server, typically available at `http://localhost:5173`.  

### Start the Backend

From the `server` directory:

```bash  
cargo run
```