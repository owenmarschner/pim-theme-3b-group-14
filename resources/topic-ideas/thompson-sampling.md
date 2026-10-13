# Thompson sampling: learning while making decisions

## The idea

Explain how an agent chooses between several options with unknown success probabilities, balancing learning about uncertain options with using those that currently look best. Focus on a fixed set of Bernoulli bandit arms, each with a constant success probability.

## Mathematical depth

- **Statistics:** derive Beta–Bernoulli posterior updates. Explain Thompson sampling: draw a possible success probability from each posterior, then select the arm with the largest draw.
- **Probability:** define expected cumulative regret as the reward lost relative to always choosing the best arm. Explain a logarithmic, problem-dependent regret bound under suitable assumptions and compare it with the Lai–Robbins lower bound.
- **Interpretation:** distinguish posterior uncertainty, actual rewards and regret. Logarithmic regret is not a guarantee for every changing environment or every prior; worst-case bounds have a different form.

Posterior updating alone would be too elementary. A carefully scoped explanation of regret theory would supply the intended advanced content; matching an optimal rate does not automatically mean matching its exact constant.

## Live educational demonstration

Simulate three slot machines with hidden success probabilities:

1. Show the posterior distributions, sampled probabilities and resulting choice at each step.
2. Compare Thompson sampling, UCB and a clearly specified ε-greedy strategy on the same underlying problem.
3. Reveal the true probabilities and show average regret over repeated runs, so one lucky run does not determine the lesson.

A/B testing and adaptive clinical trials provide motivating applications, while the demonstration remains a simple bandit model.

## Scope and group fit

Probably the most accessible of the four new suggestions. It offers clear statistics, probability and coding roles, but little substantial linear algebra. Linear bandits would add that strand at the cost of a broader project.

## Starting sources

- Thompson (1933), *On the Likelihood that One Unknown Probability Exceeds Another in View of the Evidence of Two Samples*, Biometrika.
- Russo et al. (2018), [A Tutorial on Thompson Sampling](https://web.stanford.edu/~bvr/pubs/TS_Tutorial_FnT.pdf).
- Lattimore and Szepesvári (2020), *Bandit Algorithms*, Cambridge University Press.
- Lai and Robbins (1985), *Asymptotically Efficient Adaptive Allocation Rules*, Advances in Applied Mathematics.
