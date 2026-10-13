# Gaussian processes: a probability distribution over functions

## The idea

Explain how Gaussian processes represent uncertainty about an unknown function, then use observed data to update that distribution. Focus on one-dimensional regression with Gaussian observation noise.

## Mathematical depth

- **Linear algebra:** covariance matrices, positive semidefinite kernels, Gaussian conditioning and Cholesky factorisation. Explain numerical conditioning and the O(n³) cost of standard dense factorisation for n observations.
- **Probability:** explain how consistent finite-dimensional Gaussian distributions define a process through the Kolmogorov extension theorem. Brownian motion, with covariance min(s, t), provides a concrete connection to stochastic processes.
- **Statistics:** derive the posterior predictive distribution and explain choosing kernel hyperparameters through marginal likelihood, balancing data fit and model complexity.

Mercer's theorem could provide an optional deeper connection between kernels and function expansions, under its assumptions. It need not be a second major theory strand.

## Live educational demonstration

Build a regression plot where the audience clicks to add observations:

1. Show sample functions from the prior before any observations.
2. Add points and watch the posterior mean, sample functions and uncertainty band update.
3. Adjust the kernel length scale and observation noise to explain smoothness and uncertainty.

With fixed hyperparameters, added observations reduce or preserve posterior variance; noisy observations do not force the band to collapse to zero. Label whether the band describes the latent function or a future noisy observation.

## Scope and group fit

A strong candidate for sharing work across linear algebra, probability, statistics and coding. Keep the core to Gaussian process regression; Bayesian optimisation could be a brief final application. State the deeper existence results and explain their role rather than attempting every proof.

## Starting sources

- Rasmussen and Williams (2006), [Gaussian Processes for Machine Learning](https://gaussianprocess.org/gpml/), MIT Press, freely available online. Start with regression and covariance functions.
