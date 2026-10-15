# Gaussian process regression: presentation scope

## Aim and boundaries

**Question:** How can we predict an unknown function from noisy observations and quantify uncertainty in that prediction?

Our **15-minute presentation** will answer this using one small, synthetic, one-dimensional regression example. The audience is mathematics students familiar with basic probability and linear algebra, but new to Gaussian processes (GPs).

**In scope:** a zero-mean GP prior, the squared-exponential kernel, independent Gaussian observation noise, and posterior prediction by Gaussian conditioning. Use fixed, manually chosen hyperparameters; vary length scale and noise only to illustrate their effects.

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

## Educational demonstration

Use a live, interactive one-dimensional regression plot where audience members click to add observations and see the estimated function and its uncertainty update immediately.

1. **Start with the prior:** show sample functions before any observations to illustrate the range of functions the model considers plausible.
2. **Add observations:** invite the audience to add a few points. After each click, update the posterior mean, sample functions and a labelled pointwise 95% uncertainty band for the latent function. Keep hyperparameters fixed so the audience can see how observations reduce or preserve uncertainty; Gaussian observation noise means the mean need not pass through every point and uncertainty need not vanish there.
3. **Explore assumptions:** keep the observations fixed and adjust length scale, then observation noise, separately. Ask the audience to predict each effect before showing how the estimated function and uncertainty change.

## Draft presentation outline

| Time | Content | Visual or mathematical anchor |
| --- | --- | --- |
| 0–1 min | Motivate prediction between noisy observations. Why is one fitted curve insufficient? | One dataset and several plausible curves. |
| 1–4 min | Introduce the GP prior and kernel. | Gaussian vectors → sampled functions; explain length scale. |
| 4–8 min | Explain the update from prior to posterior. | Joint block Gaussian → posterior equations, with every symbol defined. |
| 8–13 min | Live educational demonstration: show the prior (1 min), let the audience add observations (2 min), then vary length scale and noise separately (2 min). | Posterior mean, sample functions and labelled uncertainty band updating live. |
| 13–15 min | Interpret the demo, explain limitations and answer the opening question. | Kernel assumptions, uncertainty interpretation and a brief note on dense computation cost. |


## Shared reading path — every member

Complete these in order **before splitting the work**. Allow roughly **3 hours**, including notes; read only the named sections. The checkpoints are short discussion prompts, not written assignments.

| Step | Resource and bounded task | Checkpoint |
| --- | --- | --- |
| 1 · Intuition · 35 min | Görtler, Kehlbeck & Deussen, [A Visual Exploration of Gaussian Processes](https://distill.pub/2019/visual-exploration-gaussian-processes/) (interactive article). Work through the Gaussian, conditioning and GP explanations; experiment with the figures. | Explain a prior, a posterior and a sample function in plain language. |
| 2 · Foundations · 30 min | Rasmussen & Williams, *Gaussian Processes for Machine Learning* (2006), [Appendix A.1–A.2](https://gaussianprocess.org/gpml/chapters/RWA.pdf). Focus on positive semidefiniteness and the conditional Gaussian formula; skip the remaining appendix sections. | Identify the blocks in a joint Gaussian and explain covariance versus variance. |
| 3 · Core mathematics · 60 min | Same book, [§2.2, Function-space View](https://gaussianprocess.org/gpml/chapters/RW2.pdf). Read through equations (2.21)–(2.24); reproduce their block-conditioning argument. Skip later sections. | Explain each term in the posterior mean and covariance, including the noise term. |
| 4 · Kernel intuition · 20 min | David Duvenaud, [The Kernel Cookbook](https://www.cs.toronto.edu/~duvenaud/cookbook/). Read the introduction, “Squared Exponential” and its pitfalls only. | Predict what a shorter length scale changes and describe one modelling limitation. |
| 5 · Consolidate together · 30 min | Discuss one prior/posterior plot and talk through the derivation without reading a script. | Everyone can explain why uncertainty remains at noisy observations and how a future-observation interval differs. |
