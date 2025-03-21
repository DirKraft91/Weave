#!/bin/bash

# Script for monitoring server status and restarting it when necessary

LOG_FILE="/var/log/weave-server-monitor.log"
MAX_RETRIES=3
RETRY_COUNT=0

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

check_server() {
    curl -s -f http://localhost:8080/health > /dev/null
    return $?
}

restart_server() {
    log "Attempting to restart weave-server..."
    docker-compose -f /app/docker-compose.yml restart weave-server
    sleep 30  # Give the server time to start

    if check_server; then
        log "Server successfully restarted"
        RETRY_COUNT=0
        return 0
    else
        log "Server restart failed"
        return 1
    fi
}

# Main monitoring loop
while true; do
    if ! check_server; then
        log "Server health check failed"

        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            RETRY_COUNT=$((RETRY_COUNT + 1))
            log "Retry $RETRY_COUNT of $MAX_RETRIES"

            if restart_server; then
                log "Server is now healthy after restart"
            else
                log "Server still unhealthy after restart"
            fi
        else
            log "Maximum retries reached. Manual intervention required."
            # Here you can add sending a notification to the administrator
            RETRY_COUNT=0
            sleep 1800  # Wait 30 minutes before the next attempt
        fi
    else
        # The server is working normally, resetting the retry counter
        RETRY_COUNT=0
    fi

    sleep 60  # Check every minute
done
