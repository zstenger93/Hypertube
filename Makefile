COMPOSE_FILE=docker-compose_hyper.yml

build:
	docker-compose -f $(COMPOSE_FILE) up --build


re: stop run

run:
	docker-compose up -f $(COMPOSE_FILE)  -d

stop:
	docker-compose -f $(COMPOSE_FILE) down

clean_docker:
	docker stop $$(docker ps -q) \
	&& docker rm -f $$(docker ps -a -q) \
	&& docker rmi -f $$(docker images -q) \
	&& docker volume rm $$(docker volume ls -q) \
	&& docker system prune -a --volumes -f


execute_backend:
	docker exec -it db /bin/bash