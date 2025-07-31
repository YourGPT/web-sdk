# Copilot Todo List


## Prerequisites

### YourGPT Widget Integration
📦 **Installation**
```bash
npm install @yourgpt/widget-web-sdk
```

⚡ **Quick Start**

The YourGPT integration is set up in [`src/components/app.tsx`](src/components/app.tsx):

```typescript
import { YourGPT, useAIActions } from "@yourgpt/widget-web-sdk/react";

// Initialize SDK
YourGPT.init({
  widgetId: "271f1c55-4a82-4c7f-9634-762078763943",
  endpoint: "https://dev-widget.yourgpt.ai",
  debug: true,
});
```

## AI Actions


### Bulk Delete (`bulk_delete`)

![Bulk Delete](https://github.com/user-attachments/assets/4df1ad5d-933c-439a-9ac2-3dd9a52d5925)

- Deletes multiple todos based on specified criteria
- Supports filtering by status, category, priority, and tags
- Defaults to deleting only completed tasks if no filters provided
- Parameters:
  - `status`: Task status (todo, in_progress, done)
  - `category`: Task category
  - `priority`: Task priority (low, medium, high)
  - `tag`: Specific tag to filter by

```typescript
// If no filters provided, default to deleting only completed tasks for safety
if (!status && !category && !priority && !tag) {
  setTodos((prevTodos) => {
    const remainingTodos = prevTodos.filter(todo => todo.status !== "done");
    const deletedCount = prevTodos.length - remainingTodos.length;
    action.respond(`Successfully deleted ${deletedCount} completed tasks.`);
    return remainingTodos;
  });
  return;
}
```

### Move Todos (`move_todos`)
![Move Todos](https://github.com/user-attachments/assets/3e4c46a4-5f43-4b00-bdcc-c518b2f5d93c)

- Moves tasks between different status boards
- Supports bulk movement based on filters
- Updates task timestamps automatically
- Parameters:
  - `from`: Source status
  - `to`: Target status
  - `category`: (optional) Filter by category
  - `priority`: (optional) Filter by priority
  - `tag`: (optional) Filter by tag

```typescript
setTodos((prevTodos) => {
  const updatedTodos = prevTodos.map(todo => {
    // Check if todo matches all the criteria
    const matchesStatus = todo.status === from;
    const matchesCategory = !category || todo.category === category;
    const matchesPriority = !priority || todo.priority === priority;
    const matchesTag = !tag || (todo.tags && todo.tags.includes(tag));

    if (matchesStatus && matchesCategory && matchesPriority && matchesTag) {
      return {
        ...todo,
        status: to as Status,
        updatedAt: new Date()
      };
    }
    return todo;
  });
  
  // Rest of the function...
  return updatedTodos;
});
```

### Create Bulk Tasks (`create_bulk_tasks`)
![Create Bulk Tasks](https://github.com/user-attachments/assets/6d648857-d974-4a8b-98ea-f093c288c7df)

- Creates multiple tasks at once
- Supports two modes:
  1. Range-based creation (from-to numbers)
  2. CSV import for structured task creation
- Parameters:
  - Range mode:
    - `from`: Starting number
    - `to`: Ending number
    - `category`: (optional) Task category
    - `priority`: (optional) Task priority
    - `tag`: (optional) Task tag
  - CSV mode:
    - `csv`: CSV data with format "category,priority,title"

```typescript
// CSV import example
if (csv) {
  try {
    const csvRows = parseCSV(csv);
    
    // Create tasks from CSV data
    csvRows.forEach((row, index) => {
      // Validate and normalize priority
      let taskPriority: Priority = "medium";
      if (["low", "medium", "high"].includes(row.priority)) {
        taskPriority = row.priority as Priority;
      }

      const newTask: Todo = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
        title: row.title,
        priority: taskPriority,
        status: "todo",
        createdAt: new Date(currentDate.getTime() + index),
        updatedAt: new Date(currentDate.getTime() + index),
        category: row.category || undefined,
        tags: tag ? [tag] : undefined
      };

      tasks.push(newTask);
    });
    
    // Rest of function...
  }
}
```

### Beast Mode (`beast_mode`)
![Beast Mode](https://github.com/user-attachments/assets/68124d85-305a-4c50-ba45-da1168d38ed2)

- Activates special "forest" theme
- Provides visual feedback with emojis
- No additional parameters required

```typescript
const beastModeActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
  changeTheme("forest");
  action.respond("🔥 Beast mode activated! 🔥");
}, [changeTheme]);
```

### Deactivate Beast Mode (`deactivate_beast_mode`)
- Returns theme to light mode
- Provides visual feedback with emojis
- No additional parameters required

```typescript
const deactivateBeastModeActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
  changeTheme("light");
  action.respond("✨ Beast mode deactivated! Back to normal. ✨");
}, []);
```

### Read Todos (`read_todos`)
- Generates a comprehensive summary of all tasks
- Organizes tasks by status boards
- Shows count for each status
- Includes category information if available
- No additional parameters required

```typescript
const readTodosActionRef = useCallback((data: unknown, action: { respond: (message: string) => void }) => {
  // Organize todos by board/status
  const todosByBoard = {
    todo: todos.filter(todo => todo.status === "todo"),
    in_progress: todos.filter(todo => todo.status === "in_progress"),
    done: todos.filter(todo => todo.status === "done")
  };

  const response = `📊 All Todo Boards:\n\n` +
    `🟡 TO DO (${todosByBoard.todo.length} tasks):\n` +
    (todosByBoard.todo.length === 0 ? "   No pending tasks\n" :
      todosByBoard.todo.map((todo, index) =>
        `   ${index + 1}. ${todo.title}${todo.category ? ` [${todo.category}]` : ""}`
      ).join("\n") + "\n") +
    // Rest of formatting...
    
  action.respond(response);
}, [todos]);

```

## Next Steps

Here are some recommended next steps to enhance your Copilot Todo List application:

### Integration with YourGPT Dashboard

- Create custom AI actions in YourGPT dashboard
  
https://github.com/user-attachments/assets/10f6ddde-f721-4f53-a54f-727e91e53d46

### Choose your best suited model for your application

- Choose the best model from a wide variety of models

<img width="1904" height="962" alt="CleanShot 2025-07-31 at 16 44 16" src="https://github.com/user-attachments/assets/b90b2285-ac0d-48dd-a843-aedb42c3b551" />

## About

A modern todo list application built with Next.js, featuring both list and kanban board views.

## Features

- List view for traditional todo management
- Kanban board view for visual task organization
- Dark/Light theme support
- Responsive design
- AI-powered task management through YourGPT integration

## Project Structure

Key files:
- `src/components/app.tsx` - Main application component with YourGPT integration
- `src/components/todo-app.tsx` - Todo list view implementation
- `src/components/kanban-board.tsx` - Kanban board view implementation
- `src/types/todo.ts` - Todo type definitions

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- YourGPT Widget SDK

## ❓ FAQ

**Q: How does the application store my todos?**  
A: The application uses localStorage to persist your todos. They are automatically saved whenever changes are made and loaded when you open the app. This means your todos are stored locally in your browser.

**Q: Can I bulk create multiple tasks at once?**  
A: Yes! You can create multiple tasks in two ways:
1. Range-based creation: Create numbered tasks from X to Y
2. CSV import: Import structured tasks with categories and priorities using CSV format
```typescript
// Example CSV format:
"Work,high,Complete project documentation
Personal,medium,Buy groceries
Work,low,Review pull requests"
```

**Q: How do I use the AI features with YourGPT?**  
A: The application comes with several AI actions that you can use through the YourGPT widget:
- Change themes with voice commands
- Bulk delete tasks based on status/category/priority
- Move tasks between boards
- Create multiple tasks at once
- Get a summary of all your todos

**Q: What is Beast Mode?**  
A: Beast Mode is a special theme that activates a "forest" color scheme for intense focus sessions. You can toggle it on/off using the YourGPT widget with voice commands.

**Q: Will I lose my todos if I clear my browser cache?**  
A: Yes, since todos are stored in localStorage, clearing your browser data will remove them. Consider exporting important todos or taking backups if needed.

**Q: Can I use both list and kanban views?**  
A: Yes! The application provides two views:
1. List View: Traditional checklist style for simple task management
2. Kanban Board: Visual board with drag-and-drop for workflow management
You can switch between views using the navigation menu.

**Q: How do task priorities work?**  
A: Tasks can have three priority levels:
- Low: For non-urgent tasks
- Medium: Default priority for regular tasks
- High: For urgent or important tasks
Priorities can be set when creating tasks and updated later.

**Q: Can I categorize my tasks?**  
A: Yes! You can:
- Add categories to organize tasks
- Filter tasks by category
- Use tags for additional organization
- Bulk manage tasks within categories

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/copilot-todo-list.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`
5. Make your changes and add tests
6. Run tests: `npm test`
7. Submit a pull request

### Code Standards
- TypeScript: Strict typing required
- ESLint: All rules must pass
- Testing: New features require tests
- Documentation: Public APIs must be documented

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/copilot-todo-list/issues)
- 📖 Documentation: [Project Wiki](https://github.com/yourusername/copilot-todo-list/wiki)
- 💬 Discord: [Join our community](https://discord.gg/your-invite)

## 🔗 Links

- Website: [Copilot Todo List](https://your-demo-site.com)
- GitHub: [copilot-todo-list](https://github.com/yourusername/copilot-todo-list)
- Documentation: [Project Documentation](https://your-docs-site.com)

Made with ❤️ by YourGPT Team
