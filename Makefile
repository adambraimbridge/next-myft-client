include n.Makefile

unit-test:
	@echo "Testing…"
	karma start --single-run

test: verify unit-test

test-dev:
	@echo "Testing…"
	karma start --browsers Chrome
