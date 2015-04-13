PORT := 3003
OBT := $(shell which origami-build-tools)

.PHONY: test

install:
ifeq ($(OBT),)
	@echo "You need to install origami build tools first!  See docs here: http://origami.ft.com/docs/developer-guide/building-modules/"
	exit 1
endif
	origami-build-tools install

test:
	./node_modules/karma/bin/karma start --single-run
	origami-build-tools verify

build:
	@./node_modules/.bin/gulp

watch:
	@./node_modules/.bin/gulp watch

heroku-cfg:
	@heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git
