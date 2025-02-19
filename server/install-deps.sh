#!/usr/bin/env bash
  set -euo pipefail

  echo "Installing project dependencies..."

  unameOut="$(uname -s)" && \
  case "${unameOut}" in \
    Linux*)     OS=Linux ;; \
    Darwin*)    OS=Mac ;; \
    *)          OS="UNKNOWN:${unameOut}" ;; \
  esac

  if [ "$OS" = "UNKNOWN:${unameOut}" ]; then \
    echo "Unsupported operating system. This script only supports Linux and macOS. Please install dependencies manually."; \
    exit 1; \
  fi

  # On Linux, ensure essential packages are installed
  if [ "$OS" = "Linux" ]; then \
    for package in build-essential pkg-config libssl-dev libclang-dev libfontconfig1-dev clang; do \
      if ! dpkg -s $package > /dev/null 2>&1; then \
        echo "Installing $package..."; \
        if {{is_root}}; then \
          apt update; \
          apt install $package -y; \
        else \
          sudo apt update; \
          sudo apt install $package -y; \
        fi; \
      else \
        echo "$package is already installed."; \
      fi; \
    done; \
  fi

  if ! cargo prove --version > /dev/null 2>&1; then \
    echo "Installing SP1..."
    curl -L https://sp1.succinct.xyz | bash; \
    source ~/.bashrc || source ~/.bash_profile || source ~/.zshrc; \

    echo "Running sp1up to install SP1 toolchain..."
    sp1up

    if cargo prove --version > /dev/null 2>&1; then \
      echo "SP1 installation successful!"; \
      cargo prove --version; \
    else \
      echo "SP1 installation may have failed. Please check and install manually if needed."; \
    fi
  else \
    echo "SP1 is already installed."; \
  fi

  for tool in cargo-udeps cargo-llvm-cov cargo-nextest; do \
    if ! command -v $tool > /dev/null; then \
      echo "Installing $tool..."; \
      cargo install $tool; \
    else \
      echo "$tool is already installed."; \
    fi; \
  done

  source ~/.bashrc || source ~/.bash_profile || source ~/.zshrc

  echo "All dependencies installed successfully!"
