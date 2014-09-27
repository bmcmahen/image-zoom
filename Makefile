scripts:
	@duo index.js > dist/imagezoom.js -g Imagezoom

styles:
	@duo index.css > dist/imagezoom.css

dev:
	@duo index.js > dist/imagezoom.js -g Imagezoom -w

.PHONY: scripts styles
