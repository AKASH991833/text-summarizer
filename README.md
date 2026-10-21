# Text Summarizer

Paste an article and get a tight extractive summary, powered by TextRank - the graph algorithm from the same family as Google's original PageRank - running entirely in your browser.

**Live demo: https://akash991833.github.io/text-summarizer/**

![Summary](docs/screenshot-desktop.png)

## Features

- **True TextRank** - sentences become nodes, cosine-overlap becomes weighted edges, and 40 rounds of PageRank-style iteration rank every sentence. Picks are shown in original order.
- **Adjustable length** from 10% to 60% of the source.
- **Keyword extraction** with frequency bars.
- **"Why these sentences" view** - the original article with chosen sentences highlighted, each tagged with its TextRank score.
- **Stats**: words in/out, compression ratio, and a Flesch readability score for the source.
- **Sample article, one-click copy, .txt download.**
- **Dark and light mode**, mobile friendly, installable PWA, fully offline.

![Mobile](docs/screenshot-mobile.png)

## Honest limits

Extractive summaries pick the most central existing sentences; they do not rewrite or paraphrase like a large language model, so flow can feel choppy on some texts.

## Tech

Vanilla HTML/CSS/JS, hand-rolled sentence tokenizer, graph ranking and readability scoring. No libraries, no network calls.

## Run locally

```bash
python3 -m http.server 8000
```
