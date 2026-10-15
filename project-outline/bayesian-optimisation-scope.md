# Bayesian optimisation: project scope

## Aim and boundaries

**Question:** How should we choose the next experiment to find a function’s maximum when evaluations are expensive?

Our **15-minute presentation and report** will focus on Bayesian optimisation (BO): using a probabilistic model to make sequential decisions under uncertainty. Assume the audience knows basic probability, calculus, linear algebra and Bayesian updating. Gaussian processes (GPs) provide brief background, not the main mathematical contribution.

**In scope:** maximising a continuous, noise-free, black-box function on a bounded one-dimensional interval with a fixed evaluation budget. Use a zero-mean GP with a squared-exponential kernel and fixed hyperparameters. Derive expected improvement (EI) and compare its decisions with an upper-confidence-bound (UCB) acquisition rule. The synthetic examples simulate costly evaluations; they are cheap enough to run live.

**Report depth:** give the full EI derivation, analyse its limiting behaviour, and compare EI, UCB and uniform random search on two contrasting test functions. Use equal evaluation budgets, shared initial observations and repeated initial designs; report best-observed value versus evaluations, including variability. Examine sensitivity to kernel length scale and the UCB exploration parameter. The presentation explains the central argument and demonstrates one example.

**Outside scope:** noisy acquisitions, hyperparameter fitting, high-dimensional or constrained optimisation, and convergence proofs.

**Overall goal:** Explain why BO chooses a point, derive EI, and critically assess when the approach helps or fails.

## Understanding and theory required

Everyone should understand conditional expectation, Gaussian densities, integration and basic optimisation. The new material centres on decision-making, rather than re-deriving familiar Gaussian conditioning.

- **GP background:** state how a kernel and observations give a posterior mean $\mu_n(x)$ and standard deviation $\sigma_n(x)$. Explain these as predictions and model-dependent uncertainty; reserve the conditioning equations for the report.
- **Sequential decisions:** distinguish learning the entire function from finding its maximum. Explain the loop: update the surrogate → maximise a cheap acquisition function → evaluate the expensive objective → repeat until the budget is used.
- **Expected improvement:** let $f_n^+$ be the best observed value and define $I_n(x)=\max(f(x)-f_n^+,0)$. Integrate against the Gaussian posterior to obtain
  $$
  \operatorname{EI}_n(x)=(\mu_n(x)-f_n^+)\Phi(z)+\sigma_n(x)\phi(z),
  \qquad z=\frac{\mu_n(x)-f_n^+}{\sigma_n(x)}.
  $$
  Define $\phi,\Phi$ as the standard normal density and distribution function. Explain EI as expected one-step gain, not a globally optimal multi-step strategy. Handle zero uncertainty using $\max(\mu_n(x)-f_n^+,0)$; in the report, show why EI increases with either mean or uncertainty when the other is held fixed.
- **Exploration versus exploitation:** compare EI with $\operatorname{UCB}_n(x)=\mu_n(x)+\kappa\sigma_n(x)$, where $\kappa\geq0$. Explain how $\kappa$ changes the decision; no regret guarantee is claimed for a fixed setting.
- **Evaluation and limitations:** assess progress by the best value actually observed. Discuss kernel misspecification, missed narrow peaks and acquisition optimisation; a small budget does not guarantee the true maximum.

## Educational demonstration

Build a live plot of a hidden function with multiple peaks, showing observed points, the GP mean and a labelled pointwise 95% posterior band. Place the acquisition curve below it.

1. **Audience decision:** start with three observations and ask the audience to choose the next input by clicking. Reveal the function value there and update the model; the audience chooses inputs, not output values.
2. **BO decision:** display EI, mark its maximum and evaluate that input. Repeat a few steps, asking why the algorithm chooses promising or uncertain regions. Approximate acquisition maximisation on a dense grid; only selected objective evaluations count towards the budget.
3. **Compare decisions:** on the same posterior, switch to UCB and vary $\kappa$. Show how the proposed next input changes. Finish by revealing the hidden function and comparing the best observation with its true maximum.

## Draft presentation outline

| Time | Content | Visual or mathematical anchor |
| --- | --- | --- |
| 0–2 min | The expensive-search problem and BO loop. | Hidden function, evaluation budget and sequential decisions. |
| 2–4 min | GP background needed for BO. | Posterior mean and uncertainty from a few observations. |
| 4–8 min | Derive EI and briefly contrast UCB. | Improvement integral → closed form; exploration versus exploitation. |
| 8–13 min | Live demonstration: audience choice, EI iterations, then UCB comparison. | Linked posterior and acquisition plots; best value so far. |
| 13–15 min | Interpret the outcome and limitations. | Missed peaks, model assumptions and answer to the opening question. |

## Shared reading path — every member

Complete these in order before dividing the work. Allow roughly **3 hours**; use the specified excerpts rather than reading whole texts. Checkpoints are discussion prompts.

| Step | Resource and bounded task | Checkpoint |
| --- | --- | --- |
| 1 · Intuition · 35 min | Agnihotri & Batra, [Exploring Bayesian Optimization](https://distill.pub/2020/bayesian-optimization/) (2020). Read the gold-mining motivation, BO loop, EI and UCB sections; explore the figures. Skip the application walkthrough. | Why is finding a maximum different from learning the whole function? |
| 2 · GP refresher · 25 min | Görtler, Kehlbeck & Deussen, [A Visual Exploration of Gaussian Processes](https://distill.pub/2019/visual-exploration-gaussian-processes/) (2019). Focus on conditioning, GPs and kernels. | What information do the posterior mean and uncertainty provide to BO? |
| 3 · Mathematical core · 60 min | Frazier, [A Tutorial on Bayesian Optimization](https://arxiv.org/pdf/1807.02811) (2018), §§2 and 4.1. Work through the noise-free EI argument; leave noisy extensions and other acquisitions aside. | Derive EI from expected positive improvement and explain its one-step interpretation. |
| 4 · Compare rules · 30 min | Read the [Expected Improvement (EI)](https://distill.pub/2020/bayesian-optimization/#expectedimprovementei) and [Upper Confidence Bound (UCB)](https://distill.pub/2020/bayesian-optimization/#:~:text=Upper%20Confidence%20Bound%20(UCB)) sections of Agnihotri & Batra’s *Exploring Bayesian Optimization* (Distill, 2020). Calculate both scores for two hypothetical candidates with different means and uncertainties; vary $\kappa$. | When do the rules choose different points, and why? |
| 5 · Consolidate together · 30 min | Sketch one complete BO iteration and agree the two report examples, evaluation budget and comparison protocol. | Everyone can explain the next-point decision and what would count as evidence of useful performance. |
