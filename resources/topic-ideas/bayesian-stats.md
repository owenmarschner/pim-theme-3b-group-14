# Bayesian statistics: did the coin change?

## The idea

Explain how Bayesian statistics weighs two explanations for a sequence of coin tosses: the coin's bias stayed constant, or it changed once. A streak of heads might reflect a real change or ordinary chance; the project would show how to express uncertainty about both whether a change occurred and where.

## Mathematical depth

- **Bayesian updating:** use a Beta prior and Bernoulli observations to explain how evidence updates beliefs about the probability of heads.
- **Model comparison:** derive marginal likelihoods and Bayes factors to compare the constant-bias and one-change explanations, averaging over unknown biases and possible change locations.
- **Uncertainty and prediction:** explain how prior assumptions affect the conclusion and how predictions can average over both explanations instead of choosing just one.

The model comparison and averaging over unknown quantities would provide the intended third-year-plus depth, beyond a basic application of Bayes' theorem.

## Live educational demonstration

Build an interactive display of a short, fixed sequence of coin tosses:

1. Ask the audience whether the bias changed and where they think it happened.
2. Reveal the model probabilities and a plot showing the possible change locations and their probabilities, conditional on a change.
3. Compare a misleading random streak with a genuine change, then adjust the prior assumptions while keeping the observations fixed.

The audience would see that the method expresses uncertainty rather than simply declaring “change” or “no change”. An optional final step could show a prediction for the next toss, assuming no further change.

## Scope and sources

Allow either no change or exactly one change. Use exact calculations and simulated data to explain established theory; a new detection algorithm is not required.

Starting reading: MacKay's [Model Comparison and Occam's Razor](https://www.cs.princeton.edu/courses/archive/fall09/cos597A/papers/MacKay2003-Ch28.pdf). [Bayesian Online Changepoint Detection](https://www.cs.princeton.edu/~rpa/pubs/adams2007changepoint.pdf) provides broader context, but its online algorithm is outside this project's scope.
