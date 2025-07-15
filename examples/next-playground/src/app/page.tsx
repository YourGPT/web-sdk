import { TodoApp } from "@/components/todo-app";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <ThemeSwitcher />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <TodoApp />
      </main>
    </div>
  );
}
