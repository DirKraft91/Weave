FROM rust:1.83-slim-bookworm AS builder

WORKDIR /usr/src/myapp

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        git \
        libmariadb-dev-compat \
        libmariadb-dev \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    cargo install just

COPY justfile .

RUN just install-deps

ENV PATH="/root/.sp1/bin:$PATH"

# Install diesel CLI with MySQL support
RUN cargo install diesel_cli --no-default-features --features mysql

COPY . .
COPY .env.prod .env.prod
COPY migrations /usr/src/myapp/migrations

# Set up database and run migrations
ENV DATABASE_URL="mysql://myuser:mypassword@mysql:3306/mydatabase"

# Build the Rust app
RUN cargo clean && just build

EXPOSE 8080

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl3 \
    libmariadb-dev-compat \
    libmariadb-dev \
    ca-certificates \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the compiled app and diesel CLI from the builder
COPY --from=builder /usr/src/myapp/target/release/weave-server /usr/local/bin/weave-server
COPY --from=builder /usr/local/cargo/bin/diesel /usr/local/bin/diesel
# Copy the migrations directory from the builder stage
COPY --from=builder /usr/src/myapp/migrations /usr/src/myapp/migrations

# Default command (if not overridden by docker-compose)
CMD ["/usr/local/bin/weave-server", "serve"]
