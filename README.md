# TuitionMate

A static, front-end-only student project: a home page plus login, sign-up and password-reset pages with an animated space background. Built with plain HTML, CSS and JavaScript (no build step, no frameworks).

> **Demo only.** Authentication is not connected. Nothing is saved to a server, and no emails are sent.

## Run it

1. Unzip the folder.
2. Double-click `index.html` (or open it in any modern browser).

No installation needed. Fonts and icons load from Google Fonts and Font Awesome, so an internet connection is needed for them to appear.

## Files

| File | What it does |
|---|---|
| `index.html` | Home page: hero, features, popular subjects (with search), footer |
| `login.html` | Login page (centered card, space background) |
| `signup.html` | Create-account page |
| `forgot-password.html` | Reset-password page |
| `style.css` | All styles for every page |
| `script.js` | All behaviour for every page (each feature only runs if its elements exist) |

## Page links

- Home → **Login** / **Sign Up** / **Get Started** → `login.html` / `signup.html`
- Login → **Sign Up** → `signup.html`, **Forgot password?** → `forgot-password.html`
- Sign up and reset pages → **Login** / **Back to Login** → `login.html`
- Google / GitHub buttons show a "not connected in this demo" notice (no real OAuth).

## Features

**All pages**
- Dark / light theme toggle (moon/sun button), remembered between visits
- Accent colour picker (palette button, bottom-left): blue, green, purple, orange, rose. It recolours buttons, links and highlights on every page, including login and sign up.
- Responsive navbar with hamburger menu on small screens

**Home page**
- Animated counters, subject search filter, back-to-top button

**Login / Sign up / Reset pages**
- Animated space background: twinkling stars, sparkle stars, shooting stars, mouse parallax and a glowing horizon (drawn on a `<canvas>`; shows a still sky if the system has "reduce motion" on)
- Form validation with inline error messages
  - Email must look like `name@site.com`
  - Password must be at least 6 characters
  - Sign up also needs a name (2+ characters) and a matching confirm password
- Show / hide password button
- Login: "Remember me" saves the email in the browser's `localStorage`
- Sign up: shows a success message, then redirects to `login.html`
- Reset: shows a confirmation message (no email is sent)

## Customising

- **Starfield density / speed:** `initStarfield()` in `script.js` (star count uses `width * height / 3200`; shooting-star chance is `0.012` per frame).
- **Horizon glow colours:** `.space-horizon` in `style.css`.
- **Accent colours:** the `body[data-accent="..."]` rules in `style.css`.
- **Connecting a real backend:** replace the success handlers in `initLoginForm()`, `initSignupForm()` and `initForgotForm()` in `script.js` with real API calls.

## Browser support

Current Chrome, Edge, Firefox and Safari. The accent tints use `color-mix()`, which needs a reasonably recent browser.
