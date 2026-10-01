# CodePath — Coding E-Learning Platform

A responsive frontend prototype for a coding e-learning platform. It is deliberately built with sample data only: there is no login service, database, or code-execution server yet.

## Start it locally

1. Install the current **LTS version of Node.js** from [nodejs.org](https://nodejs.org/).
2. Open a terminal inside this project folder.
3. Run `npm install` once. This downloads the project packages.
4. Run `npm run dev`.
5. Open the local address that appears in the terminal, usually `http://localhost:5173`.

To create an optimized presentation build later, run `npm run build`.

## What is included

- Student dashboard and sidebar navigation
- Course library, course details, progressive module locking, lessons, and video placeholder
- Editable JavaScript exercise editor, test display, run/submit demo actions
- Daily labs, quiz, assignments, grades/feedback, and learning progress
- Responsive layout for desktop and mobile
- Instructor and administrator dashboard shells for the next phase

## Project structure

```
src/
  main.jsx             # Pages, navigation, and presentation components
  data/mockData.js     # Temporary sample data; replace with REST API calls later
  styles.css           # Responsive visual design
index.html             # Application entry page
package.json           # Commands and React/Vite dependencies
```

## Connecting a backend later

Keep page components in `src/main.jsx` and replace data imported from `src/data/mockData.js` with a small API service (for example `src/services/api.js`). The screens already consume data in a predictable course/module/lesson format, so the visual interface does not need to be redesigned when the REST API is ready.
