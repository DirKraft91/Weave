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
│   ├── ci/    # Configuration to run celestia locally
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
---

### Adding a new TransactionType

This will create a new transaction type with the specified fields and prepares both the transaction and state handling code automatically. Make sure you are in the rollup directory before you’re using `shard create-tx ...`

```bash
shard create-tx <tx-name> [field_name field_type]...
```

For example:

```bash
shard create-tx SendMessage msg String user String
```

After creating a new transaction type, you'll need to:

1. Update the `verify()` method in `src/tx.rs` to add your custom validation logic
2. Modify the `process()` method to implement the transaction logic

### Running the rollup

To start a local celestia network, run

```bash
just celestia-up
```

### Starting the node
After installing the binary for your rollup, you can run

```bash
./target/debug serve
```

### Creating a signer
If you have enabled signature verification, you will need to use signers. Generating signers to use with your rollup is easy:

```bash
./target/debug create-signer user1
```

### Submitting transcations

Let's say you used the `SendMessage` transaction type example above. To send a transaction, you can run:

```bash
./target/debug submit-tx send-message --key-name user1 --nonce 0 "Here is my message!" "Ryan"
```

You can omit the `--key-name` if signature verification is disabled, and `--nonce` if you haven't implemented nonce controls.

## Notes

Signature verification is disabled by default to allow for quick experimentation.

To enable it, change `SIGNATURE_VERIFICATION_ENABLED` in `server/src/tx.rs`  to `true` .

Nonce control is also not implemented by default. To prevent replay attacks, ensure processed transactions increment an account nonce. See example here [COMING SOON].


## License  

This project is licensed under the MIT License.  

---

Feel free to modify this README as per your project specifics! 🚀
