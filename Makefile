.PHONY: report clean

report:
	cd report && latexmk -xelatex -interaction=nonstopmode -halt-on-error main.tex

clean:
	cd report && latexmk -C main.tex
