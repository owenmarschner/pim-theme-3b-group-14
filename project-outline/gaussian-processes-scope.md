# Gaussian process regression: presentation scope

## Aim and boundaries

**Question:** How can we predict an unknown function from noisy observations and quantify uncertainty in that prediction?

Our **15-minute presentation** will answer this using one small, synthetic, one-dimensional regression example. The audience is mathematics students familiar with basic probability and linear algebra, but new to Gaussian processes (GPs).

**In scope:** a zero-mean GP prior, the squared-exponential kernel, independent Gaussian observation noise, and posterior prediction by Gaussian conditioning. Use fixed, manually chosen hyperparameters; vary length scale and noise only to illustrate their effects.

**Out of scope:** proofs of process existence or kernel validity, Brownian motion, Mercer’s theorem, marginal-likelihood optimisation, classification, Bayesian optimisation and comparisons with other regression methods. These are not required reading. This document scopes the presentation; it is not the full report plan.

**Success:** the audience can explain what a GP models, how observations update it, and what the plotted uncertainty does—and does not—mean.

## Understanding and theory required

Everyone should understand normal distributions, expectation, variance/covariance, conditional probability, matrix multiplication and positive semidefinite matrices. Refresh gaps through the reading path below.

The mathematical core we will explain is:

- **From vectors to functions:** a GP is a collection of random variables whose every finite subset is jointly Gaussian. A mean function and covariance kernel specify these finite distributions.
- **Encoding assumptions:** form the covariance matrix using
  \(k(x,x')=\sigma_f^2\exp[-(x-x')^2/(2\ell^2)]\).
  Explain signal variance, length scale and why a covariance matrix must be positive semidefinite. Changing length scale changes how rapidly typical functions vary.
- **Learning from observations:** assume \(y_i=f(x_i)+\epsilon_i\), with independent \(\epsilon_i\sim N(0,\sigma_n^2)\). Write the joint Gaussian distribution of observations and test function values, then apply the Gaussian conditioning identity to obtain the posterior mean and covariance. State the identity; derive the GP result by identifying its blocks, rather than proving the identity.
- **Interpreting uncertainty:** distinguish the latent function from future noisy observations. Show pointwise 95% posterior intervals for the latent function; these are conditional on our model and chosen hyperparameters, not guarantees that the whole curve lies inside them.

## Presentation flow

| Time | Content | Visual or mathematical anchor |
| --- | --- | --- |
| 0–2 min | Motivate prediction between noisy observations. Why is one fitted curve insufficient? | One dataset and several plausible curves. |
| 2–5 min | Introduce the GP prior and kernel. | Gaussian vectors → sampled functions; two length scales. |
| 5–9 min | Explain the update from prior to posterior. | Joint block Gaussian → posterior equations, with every symbol defined. |
| 9–13 min | Return to the same example and interpret predictions. | Add observations; compare length scale and noise separately. |
| 13–15 min | Explain limitations and answer the opening question. | Kernel assumptions, uncertainty interpretation and a brief note on dense computation cost. |

## Work to complete

Assign a lead and a reviewer to each work package after the shared reading; combine packages as needed for the group size. Everyone should understand the complete argument.

| Work package | Concrete output |
| --- | --- |
| Theory and notation | Checked derivation of the posterior equations, with matrix dimensions and source references. |
| Example and figures | Reproducible small dataset; prior and posterior plots; separate length-scale and noise comparisons. Use Cholesky solves rather than explicit matrix inversion. |
| Slides and explanation | Approximately 8 slides following the timings above, consistent notation, readable figures and citations. |
| Verification and rehearsal | Cross-check predictions against a trusted implementation; check interval labels; rehearse transitions and finish within 15 minutes. |

**Demo boundary:** prepared plots are sufficient. Add live interaction only after the slides and mathematics are complete, and retain static backups. With hyperparameters fixed, adding observations cannot increase posterior variance; noisy data need not collapse it to zero.

## Shared reading path — every member

Complete these in order **before splitting the work**. Allow roughly **3 hours**, including notes; read only the named sections. The checkpoints are short discussion prompts, not written assignments.

| Step | Resource and bounded task | Checkpoint |
| --- | --- | --- |
| 1 · Intuition · 35 min | Görtler, Kehlbeck & Deussen, [A Visual Exploration of Gaussian Processes](https://distill.pub/2019/visual-exploration-gaussian-processes/) (interactive article). Work through the Gaussian, conditioning and GP explanations; experiment with the figures. | Explain a prior, a posterior and a sample function in plain language. |
| 2 · Foundations · 30 min | Rasmussen & Williams, *Gaussian Processes for Machine Learning* (2006), [Appendix A.1–A.2](https://gaussianprocess.org/gpml/chapters/RWA.pdf). Focus on positive semidefiniteness and the conditional Gaussian formula; skip the remaining appendix sections. | Identify the blocks in a joint Gaussian and explain covariance versus variance. |
| 3 · Core mathematics · 60 min | Same book, [§2.2, Function-space View](https://gaussianprocess.org/gpml/chapters/RW2.pdf). Read through equations (2.21)–(2.24); reproduce their block-conditioning argument. Skip later sections. | Explain each term in the posterior mean and covariance, including the noise term. |
| 4 · Kernel intuition · 20 min | David Duvenaud, [The Kernel Cookbook](https://www.cs.toronto.edu/~duvenaud/cookbook/). Read the introduction, “Squared Exponential” and its pitfalls only. | Predict what a shorter length scale changes and describe one modelling limitation. |
| 5 · Consolidate together · 30 min | Discuss one prior/posterior plot and talk through the derivation without reading a script. | Everyone can explain why uncertainty remains at noisy observations and how a future-observation interval differs. |

**Role-specific follow-up only:** the example lead reads Algorithm 2.1 in Chapter 2 and Appendix A.4 on Cholesky decomposition. Use the textbook as the mathematical reference and the visual resources to build intuition; cite sources on the relevant slides.
