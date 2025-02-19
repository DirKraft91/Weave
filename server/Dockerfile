# Use Rust slim image for building
FROM rust:1.83-slim-bookworm AS builder

WORKDIR /usr/src/myapp

# Install essential dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        build-essential \
        pkg-config \
        libssl-dev \
        libclang-dev \
        libfontconfig1-dev \
        clang && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency installation script
COPY install-deps.sh /usr/src/myapp/install-deps.sh
RUN chmod +x /usr/src/myapp/install-deps.sh && /usr/src/myapp/install-deps.sh

# Copy project files
COPY . .

# Build the project
RUN cargo build --release

# Use a minimal runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends libssl3 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the built binary from the builder stage
COPY --from=builder /usr/src/myapp/target/release/weave-server /usr/local/bin/weave-server

# Run the server
CMD ["/usr/local/bin/weave-server", "serve"]
