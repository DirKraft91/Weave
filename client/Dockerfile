FROM nginx:alpine

# Install Certbot for SSL
RUN apk add --no-cache certbot certbot-nginx ca-certificates

# Copy the build output to Nginx's web directory
COPY ./dist /usr/share/nginx/html
COPY ./dist /var/www/html/

# Copy the custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports for HTTP and HTTPS
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
