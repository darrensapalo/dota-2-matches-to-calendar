# Builds the latest docker image.
build:
	docker build -t darrensapalo/dota-2-matches-to-calendar:latest .

# Pushes the latest docker image to docker hub.
push:
	docker push darrensapalo/dota-2-matches-to-calendar:latest