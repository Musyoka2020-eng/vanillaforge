# Todo App Example

A complete working example of a todo application built with VanillaForge. This example shows how to build a real-world application with multiple features and demonstrates best practices for component architecture, state management, and user interaction.

## What This Example Demonstrates

This todo app showcases several key VanillaForge concepts:

- **Component Architecture** - How to structure an app with multiple components
- **State Management** - Managing and updating application data
- **Event Handling** - Responding to user interactions
- **Data Persistence** - Saving data to browser local storage
- **Responsive Design** - Making the app work on different screen sizes

## Features

The todo application includes these features:

- Add/remove todos
- Mark todos as complete
- Filter todos (all/active/completed)
- Local storage persistence
- Responsive design

## Running the Example

To run this example locally, you can either open the HTML file directly or use a local server:

```bash
# From the framework root directory
cd examples/todo-app
open index.html
```

Or serve it with a local server:

```bash
npx http-server examples/todo-app -p 3001
```

## Code Structure

- `index.html` - Main HTML file
- `app.js` - Todo application logic
- `styles.css` - Application styles

This example demonstrates:
- Component composition
- State management
- Event handling
- Local storage integration
- Responsive design patterns
