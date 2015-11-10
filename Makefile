PORT := 3003
OBT := $(shell which origami-build-tools)

.PHONY: test

install:
ifeq ($(OBT),)
	@echo "You need to install origami build tools first!  See docs here: http://origami.ft.com/docs/developer-guide/building-modules/"
	exit 1
endif
	origami-build-tools install

verify:
	nbt verify --skip-layout-checks --skip-dotenv-check

test: unit-test verify

unit-test:
	./node_modules/karma/bin/karma start --single-run

test-dev:
	./node_modules/karma/bin/karma start --browsers Chrome


build:
	@./node_modules/.bin/gulp

watch:
	@./node_modules/.bin/gulp watch

heroku-cfg:
	@heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git
