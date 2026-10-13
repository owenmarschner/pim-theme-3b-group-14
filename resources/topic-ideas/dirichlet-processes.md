# Dirichlet processes: clustering without fixing the number of groups

## The idea

Explain how a Bayesian mixture model can allow the number of occupied clusters to vary rather than fixing it in advance. Introduce the Dirichlet process as a distribution over probability distributions, then connect it to clustering through a simple one-dimensional Gaussian mixture.

## Mathematical depth

- **Probability:** introduce Ferguson's definition through finite partitions and Dirichlet distributions. Explain stick-breaking and the Chinese restaurant process as related descriptions of the same underlying model.
- **Exchangeability:** use de Finetti's theorem to explain the relationship between conditionally independent observations and their shared random distribution. State the relevant theorem rather than attempting its full proof.
- **Statistics:** distinguish a Dirichlet process from a Dirichlet process mixture. Explain how the concentration parameter affects clustering and how Gibbs sampling updates cluster assignments using both prior cluster sizes and the observed data.

These connections provide substantial advanced probability, but would require careful explanation of unfamiliar concepts.

## Live educational demonstration

Build two linked views:

1. Animate the Chinese restaurant process: each new customer joins an existing table or starts another. Adjust the concentration parameter to show its effect on the prior number of groups.
2. Display a small dataset and animate a mixture-model Gibbs sampler reassigning points between clusters. Show several posterior clusterings rather than presenting one arrangement as certain.

Make the distinction explicit: the restaurant animation illustrates a prior; the Gibbs sampler incorporates observations.

## Scope and group fit

The most mathematically demanding of these suggestions, with a strong probability and statistics emphasis but little natural linear algebra. Keep the mixture example one-dimensional with simple conjugate choices. This approach avoids fixing the number of clusters, but does not guarantee recovery of a “true” number of groups.

## Starting sources

- Ferguson (1973), *A Bayesian Analysis of Some Nonparametric Problems*, Annals of Statistics.
- Sethuraman (1994), *A Constructive Definition of Dirichlet Priors*, Statistica Sinica.
- Ghosal and van der Vaart (2017), *Fundamentals of Nonparametric Bayesian Inference*, Cambridge University Press.
- Miller and Harrison (2014), [Inconsistency of Pitman–Yor Process Mixtures for the Number of Components](https://jmlr.org/papers/v15/miller14a.html), for the limitation on interpreting cluster counts.
