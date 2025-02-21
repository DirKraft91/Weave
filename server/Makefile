build:
	docker-compose up --build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

ps:
	docker-compose ps

up-migraitons:
	diesel migration run

down-migraitons:
	diesel migration redo

new-migraiton:
	diesel migration generate migraiton_name
