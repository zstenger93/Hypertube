
build:
	docker-compose up --build


re: stop run

run:
	docker-compose up -d

stop:
	docker-compose down

clean_docker:
	docker stop $$(docker ps -q) \
	&& docker rm -f $$(docker ps -a -q) \
	&& docker rmi -f $$(docker images -q) \
	&& docker volume rm $$(docker volume ls -q) \
	&& docker system prune -a --volumes -f


execute_backend:
	docker exec -it db /bin/bash