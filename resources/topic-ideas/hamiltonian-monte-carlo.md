# Hamiltonian Monte Carlo: sampling using dynamics

## The idea

Explain how Hamiltonian Monte Carlo (HMC) uses simulated motion to explore a probability distribution more effectively than a random-walk sampler. Use a correlated Gaussian target throughout to keep the geometry visible and the mathematics contained.

## Mathematical depth

- **Dynamics:** Hamiltonian flow, conservation of energy and volume preservation through Liouville's theorem. Explain why the leapfrog integrator is symplectic and reversible, although it does not conserve energy exactly.
- **Probability:** explain how momentum refreshment and the Metropolis correction preserve the target distribution. Treat basic Metropolis–Hastings as background if already covered in the Bayesian unit.
- **Linear algebra:** show how poorly scaled directions restrict the numerical step size and how choosing a suitable mass matrix acts as preconditioning.
- **High dimensions:** optionally explain asymptotic efficiency results. Under specific product-target assumptions, HMC uses O(d^(1/4)) leapfrog steps per fixed-duration trajectory to maintain non-vanishing acceptance, while random-walk Metropolis has an O(d) mixing timescale. These are not universal iteration or runtime comparisons.

## Live educational demonstration

Animate random-walk Metropolis and HMC on the same elongated, two-dimensional density:

1. Show small random steps beside HMC trajectories that follow the distribution's geometry.
2. Increase HMC's step size to reveal numerical energy errors and rejected proposals.
3. Change the mass matrix and show how better scaling changes exploration.

Display both sampling progress and computational effort; equal numbers of proposals do not represent equal work.

## Scope and group fit

A strong option for a group interested in dynamical systems, probability and linear algebra. Focus on the Gaussian example, leapfrog and invariance; present high-dimensional scaling as an extension rather than attempting its full proof. Avoid adding adaptive HMC or NUTS.

## Starting sources

- Duane et al. (1987), *Hybrid Monte Carlo*, Physics Letters B.
- Neal (2011), *MCMC Using Hamiltonian Dynamics*, Handbook of Markov Chain Monte Carlo.
- Roberts, Gelman and Gilks (1997), *Weak Convergence and Optimal Scaling of Random Walk Metropolis Algorithms*, Annals of Applied Probability.
- Beskos et al. (2013), [Optimal Tuning of the Hybrid Monte Carlo Algorithm](https://discovery.ucl.ac.uk/id/eprint/77553/), Bernoulli.
