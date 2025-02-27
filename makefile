sync-files:
	scp -r ~/Documents/Projects/my-projects/twitter-acc-prism/client dima@159.223.29.217:/app && scp -r ~/Documents/Projects/my-projects/twitter-acc-prism/server dima@159.223.29.217:/app && scp -r ~/Documents/Projects/my-projects/twitter-acc-prism/docker-compose.yml dima@159.223.29.217:/app
copy-files:
	cp -r ./client/dist /usr/share/nginx/html && cp -r ./client/dist /var/www/html && cp -r ./client/nginx.conf /etc/nginx/conf.d/default.conf