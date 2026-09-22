const STORAGE_KEY = "tasks";
let tasks = load();
let filter = "all";

const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const countLabel = document.getElementById("countLabel");
const clearBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter");

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  list.innerHTML = visible
    .map(
      (t) => `
      <li class="task ${t.done ? "done" : ""}" data-id="${t.id}">
        <input type="checkbox" ${t.done ? "checked" : ""} aria-label="Mark complete">
        <span>${escapeHtml(t.text)}</span>
        <button type="button" aria-label="Delete task">✕</button>
      </li>`
    )
    .join("");

  emptyState.hidden = visible.length !== 0;
  const remaining = tasks.filter((t) => !t.done).length;
  countLabel.textContent = `${remaining} task${remaining === 1 ? "" : "s"} left`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: crypto.randomUUID(), text, done: false });
  input.value = "";
  save();
  render();
});

list.addEventListener("click", (e) => {
  const li = e.target.closest(".task");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.matches("input[type='checkbox']")) {
    const task = tasks.find((t) => t.id === id);
    task.done = !task.done;
    save();
    render();
  }

  if (e.target.matches("button")) {
    tasks = tasks.filter((t) => t.id !== id);
    save();
    render();
  }
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

render();
