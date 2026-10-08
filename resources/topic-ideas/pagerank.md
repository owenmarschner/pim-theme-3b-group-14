# PageRank: how network rankings work

## The idea

Explain how PageRank uses a network's connections to rank its nodes, why the algorithm settles on a unique answer, and how changing a connection can affect that ranking. Use one small network throughout to connect the intuition to the mathematics.

## Mathematical depth

- **Markov chains:** interpret PageRank as the long-run location probabilities of a random walker who follows links and occasionally jumps to a random node.
- **Convergence:** use the contraction mapping theorem to prove that different starting distributions approach the same answer, and bound how quickly they do so.
- **Sensitivity:** use matrix perturbation bounds to explain how much scores can change when the network changes. Show why even small score changes can reverse closely matched ranks.

The convergence and sensitivity analysis would provide the intended third-year-plus depth, beyond a basic explanation of the algorithm.

## Live educational demonstration

Build an interactive network with six to eight nodes:

1. Animate probability flowing along links and being redistributed by random jumps.
2. Start from two different nodes and show the distributions converging to the same scores.
3. Change a connection's strength and watch the scores and ranking update, comparing the change with the theoretical bound.

Ask the audience to predict each result before revealing it. The demonstration would make the proofs tangible, rather than simply display the algorithm's output.

## Scope and sources

Focus on standard PageRank, convergence and sensitivity. Explain established results; no new algorithm or original research is required.

Starting reading: Gleich's [PageRank Beyond the Web](https://arxiv.org/abs/1407.5107) and selected sections of [Models and Algorithms for PageRank Sensitivity](https://www.cs.purdue.edu/homes/dgleich/publications/thesis-index.html).
