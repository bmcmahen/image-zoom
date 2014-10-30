
scripts:
	@duo index.js > dist/imagezoom.js -g Imagezoom

styles:
	@duo index.css > dist/imagezoom.css

dev:
	@duo index.js > dist/imagezoom.js -g Imagezoom -w

test.js: test/test.js
	@duo $< > build.js

tests: test.js
	@duo-test browser -c make

clean:
	rm build.js

.PHONY: tests
