# Mini Draw

SSUI Final Project
Fall 2021

Group: Drawing Nerds

Neha Deshmukh, Jenny Song, Tadpol Rachatasumrit

## Getting Started

Before starting, make sure you have access to the firebase project of this website. Contact trachata@andrew.cmu.edu.

To start the project, follow these steps.

1. Clone the code from GitHub. Run: `git clone https://github.com/tadpolr/MiniDraw.git`
2. Replace the firebaseConfig in the config.js file with the config firebase project. The required configs are apiKey, authDomain, projectId, and appId. The final config.js should look like this.

```
  export const firebaseConfig = {
    apiKey: '<api-key-from-firebase>',
    authDomain: '<auth-domain-from-firebase>',
    projectId: '<project-id-from-firebase>',
    appId: '<app-id-from-firebase>',
  };
```

3. Run `npm install` to install all the necessary packages.
4. Run `npm start` to start the project.
