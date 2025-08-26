
build:
	docker compose up --build


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


test_unix:
	python3 -m venv venv
	. venv/bin/activate && pip install -r requirements.txt && python3 test.py

test_windows:
	python.exe -m venv venv
	venv\Scripts\python.exe -m pip install -r requirements.txt
	venv\Scripts\python.exe test.py