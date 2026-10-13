# Finite differences: solving the Black–Scholes equation

## The idea

Explain how an option's known payoff at expiry can be used to calculate its value at earlier times by solving the Black–Scholes equation numerically. Replace continuous changes in time and asset price with a grid, then show why some ways of stepping through that grid work reliably while others become unstable.

## Mathematical depth

- **Differential equations:** briefly motivate the Black–Scholes PDE through hedging, explain its terminal and boundary conditions, and connect it to the heat equation through a change of variables.
- **Numerical analysis:** derive explicit and implicit finite difference schemes. Use truncation error and stability analysis to explain consistency, convergence and restrictions on the explicit time step.
- **Linear algebra:** explain the tridiagonal systems solved by the implicit method and how the update matrix controls the propagation of errors.

The stability and convergence analysis would provide the intended third-year-plus depth. Working with the transformed heat equation keeps that analysis manageable. Stability alone does not guarantee accuracy: even a stable scheme can give poor answers on a coarse grid.

## Live educational demonstration

Build an interactive option-pricing plot:

1. Start with a European call's payoff at expiry and animate the calculated value curve moving backwards towards today.
2. Change the time step and grid spacing. Show the explicit method becoming unstable when its stability condition is violated, then compare it with the implicit method.
3. Refine the grid and compare the numerical solution with the analytical Black–Scholes price, displaying the error as well as the curve.

Ask the audience to predict which settings will work before running them. Keep the financial parameters fixed during the stability demonstration so that numerical errors are clearly distinguished from changes in the model.

## Scope and sources

Focus on one European call with constant volatility and interest rate, comparing explicit and implicit Euler schemes. Use a finite computational domain with appropriate boundary conditions. Crank–Nicolson could be a short extension; American options and more complex market models are outside scope. Explain established methods rather than develop a new pricing algorithm.

Starting reading: Wilmott, Howison and Dewynne, *The Mathematics of Financial Derivatives* (1995), and [Cornell's finite difference option-pricing exercise](https://www.cs.cornell.edu/Info/Courses/Spring-98/CS522/content/lab4.pdf).
