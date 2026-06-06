# Chernoff Faces Website

[![Live](https://img.shields.io/badge/live-chernofffaces-red)](https://maltehueckstaedt.github.io/chernoff_faces/)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=flat&logo=github&logoColor=white)

## About

**Chernoff Faces** is a collective of self-taught artists and designers making films. Founded by Malte Hückstädt, the collective takes its name from Herman Chernoff's multivariate data visualization method — not for any particularly serious reason beyond liking the name.

Originally a data scientist collective, Chernoff Faces has since shifted its focus entirely to independent filmmaking. The work lives online, free from sponsors, grant providers, or producers.

> "The primary goal of the website is to be beautiful. Practicality is explicitly secondary to this."

## Current Projects

| Project | Status | Link |
|---------|--------|------|
| **Mother** | Released | [Watch on YouTube](https://www.youtube.com/@chernofffaces) |
| **Downer** | In development | — |

*Mother* is the first short film by Chernoff Faces. *Downer* is the second.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Start page — animated canvas, project navigation |
| `about.html` | FAQ-style page covering the collective's background and motivations |
| `mother.html` | Project page for *Mother* with YouTube link |
| `contact.html` | Contact form |
| `imprint.html` | Legal imprint (multilingual) |

## Technical Features

- **No build step, no framework** — pure HTML5, CSS3, and vanilla JavaScript
- **Canvas animations** — a spinning star roams between UI elements, driven by a frame-by-frame animation loop with easing, spin physics, and radius variation
- **Speech bubble explainer system** — dynamically positioned callout bubbles that follow the animated star and avoid overlapping other elements
- **Custom typography** — multiple curated font families including German Fraktur and pixel fonts, with animated text morphing between typefaces
- **Background music player** — optional ambient audio with play/stop controls
- **`prefers-reduced-motion` support** — animations are disabled when the user has this system setting enabled
- **Multilingual footer** — imprint and "Enjoy / Thank you" text in English, Chinese, Hindi, Spanish, French, and Arabic
- **SEO-ready** — Open Graph, Twitter Card, and Schema.org structured data on all pages

## Hosting

Hosted for free on GitHub Pages at [maltehueckstaedt.github.io/chernoff_faces](https://maltehueckstaedt.github.io/chernoff_faces/).

## Bugs

If you encounter any bugs, please report them in the [issue tracker](https://github.com/maltehueckstaedt/chernoff_faces/issues).