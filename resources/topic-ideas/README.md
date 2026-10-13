# Topic shortlist: guide for the group vote

This directory includes explanations of four topic ideas for our mathematical exploration project. Read this comparison page to inform your vote. Read the linked topic files if you want more detail or starting references.

The aim is a coherent group report and a 15-minute presentation, with a demonstration that helps teach the theory.

## At a glance

| Topic | What we would explain | Main mathematical areas | Live demonstration | Main challenge |
| --- | --- | --- | --- | --- |
| **Gaussian processes** | How to put a probability distribution over functions and update it using data | Linear algebra, probability and Bayesian statistics | Add observations to a plot and watch predicted curves and uncertainty change | Keeping the abstract probability theory focused and understandable |
| **Black–Scholes finite differences** | How a grid-based numerical method calculates an option's value | Differential equations, numerical analysis and linear algebra | Change the grid and reveal stable, inaccurate or unstable solutions | Explaining enough finance and PDE background without crowding out the numerical analysis |
| **Hamiltonian Monte Carlo** | How simulated dynamics can help sample a probability distribution | Dynamical systems, numerical integration and probability | Compare random-walk steps with flowing HMC trajectories | Connecting the mechanics to a convincing explanation of why the sampler is valid |
| **PageRank** | Why network rankings converge and how sensitive they are to changes | Linear algebra, Markov chains and mathematical analysis | Move probability through a network and edit its connections | Ensuring the convergence and sensitivity theory goes well beyond the basic algorithm |

## Gaussian processes: learning an unknown function

**The project.** Imagine observing a few noisy points from an unknown curve. A Gaussian process describes a distribution over possible curves, then updates that distribution when observations arrive. We would focus on one-dimensional regression with Gaussian noise and explain both the predicted curve and its uncertainty.

**The mathematical substance.** Covariance kernels describe how function values at different inputs are related. We would derive the posterior using conditional Gaussian distributions, explain positive semidefinite covariance matrices and Cholesky factorisation, and discuss selecting kernel parameters through marginal likelihood. The connection from finite Gaussian vectors to a whole random function provides a deeper probability strand; Brownian motion is a useful example. Full proofs of every existence theorem would not be necessary.

**The demonstration.** Audience members add data points to a plot. Sample curves, the mean prediction and uncertainty bands update. Controls for smoothness and observation noise show how assumptions affect what the model learns. With fixed parameters, extra observations reduce or preserve uncertainty, but noisy data do not force it to vanish.

**Why choose it?** It offers a balanced division across linear algebra, probability, statistics and coding, with an intuitive demonstration and a clear connection to machine learning.

**Main trade-off.** There is a lot of attractive surrounding theory. We would need to keep kernel expansions and Bayesian optimisation as optional extensions rather than separate major sections.

[Further detail and sources](gaussian-processes.md)

## Black–Scholes finite differences: pricing on a grid

**The project.** A European call option has a known payoff at expiry. Under the Black–Scholes assumptions, its earlier value satisfies a differential equation. We would explain how explicit and implicit finite difference methods approximate that equation on a grid and work backwards from expiry to today's value.

**The mathematical substance.** Briefly introduce the financial model, terminal and boundary conditions, and the transformation to the heat equation. Then derive the two numerical schemes and analyse their accuracy, stability and convergence. The implicit method introduces tridiagonal linear systems; the explicit method has a time-step restriction. The advanced content is the explanation of numerical reliability, not just producing an option price.

**The demonstration.** Animate the value curve evolving backwards from the payoff. Let the audience change time steps and grid spacing, predict whether the calculation will work, and see an explicit scheme become unstable. Compare both schemes with the analytical Black–Scholes solution and show how errors change as the grid is refined. A stable calculation can still be inaccurate.

**Why choose it?** It has a particularly clear scope, a strong link between proofs and visible behaviour, and an analytical answer against which to check the implementation. It suits members interested in applied mathematics, finance and computation.

**Main trade-off.** Some finance and PDE background must be introduced. We should keep the financial model to one European call with constant parameters and concentrate the report on the numerical methods. Crank–Nicolson is an optional extension.

[Further detail and sources](black-scholes-finite-differences.md)

## Hamiltonian Monte Carlo: sampling using dynamics

**The project.** Many statistical calculations require samples from a probability distribution. Random-walk samplers can explore slowly; HMC uses auxiliary momentum and simulated motion to propose longer, directed moves. We would explain this using an elongated Gaussian distribution as a running example.

**The mathematical substance.** Explain Hamiltonian dynamics and volume preservation, then show how the leapfrog integrator approximates the motion. Its reversibility and volume preservation, together with momentum refreshment and a Metropolis acceptance correction, underpin the sampling method. The mass matrix provides a linear algebra connection: suitable scaling helps the algorithm navigate differently stretched directions.

**The demonstration.** Animate random-walk Metropolis and HMC on the same two-dimensional distribution. Change the integration step size to reveal energy errors and rejected proposals, then change the mass matrix to illustrate better scaling. Compare computational effort as well as the number of samples.

**Why choose it?** It makes an engaging connection between physics and Bayesian computation, with substantial dynamics and probability theory. It is a good choice if the group particularly enjoys differential equations and mechanics.

**Main trade-off.** This has a substantial conceptual burden for a short presentation: the audience needs to understand both sampling and the dynamics. We should focus on leapfrog and why the target distribution is preserved; high-dimensional efficiency results are optional context, not another full proof strand.

[Further detail and sources](hamiltonian-monte-carlo.md)

## PageRank: reliable rankings from network connections

**The project.** PageRank assigns scores by following a random walker who moves along a network's links and occasionally jumps to a random node. We would explain why the probability distribution settles to a unique answer and how changing connections affects the scores and their ordering.

**The mathematical substance.** Build the transition matrix and interpret its stationary distribution. Use the contraction mapping theorem to prove convergence and bound its rate, then use matrix perturbation bounds to analyse sensitivity to changes in the network. Distinguish changes in scores from changes in ranking: nearly tied nodes can swap places after a small score change.

**The demonstration.** Animate probability flowing through a small network. Start from two different nodes and show convergence to the same distribution. Then change a connection's strength and display the resulting score changes alongside the theoretical bound, including an example where closely ranked nodes swap places.

**Why choose it?** The core idea is easy to introduce, and the visualisation connects directly to the mathematical operations. It offers a contained project for members interested in networks, linear algebra and probability.

**Main trade-off.** A basic explanation of PageRank would be too elementary for our intended scope. Convergence proofs and sensitivity analysis must be central, and we should check how much of that theory is already familiar from our modules.

[Further detail and sources](pagerank.md)

## What to consider when voting

- **Interest:** which mathematics would you most like to understand and explain?
- **Background:** which option extends what we know without requiring too much preliminary material?
- **Contribution:** can every member identify a meaningful mathematical or computational role?
- **Communication:** can we tell one clear story in 15 minutes, with the demonstration supporting it?

The comparison above describes proposed scopes and likely trade-offs, not guaranteed difficulty levels or marks. Vote for the project you would most like the group to develop; we can refine its boundaries once it is selected.
