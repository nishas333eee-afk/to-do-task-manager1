const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskId = document.getElementById("taskId");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem("taskflow-tasks") || "[]");
  tasks = Array.isArray(saved) ? saved : [];
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;

  document.getElementById("totalTasks").textContent = tasks.length;
  document.getElementById("completedTasks").textContent = completed;
  document.getElementById("pendingTasks").textContent =
    tasks.length - completed;

  document.getElementById("taskCount").textContent =
    `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;
}

function renderTasks() {
  taskList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm);

    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "pending" && !task.completed) ||
      (currentFilter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });

  emptyMessage.classList.toggle("hidden", filteredTasks.length > 0);

  if (filteredTasks.length === 0) {
    emptyMessage.textContent = tasks.length === 0
      ? "No tasks yet. Add your first task above!"
      : "No matching tasks found.";
  }

  filteredTasks.forEach(task => {
    const item = document.createElement("article");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("p");
    title.className = "task-name";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const badge = document.createElement("span");
    badge.className = `priority ${task.priority}`;
    badge.textContent = `${task.priority} Priority`;
    meta.appendChild(badge);

    if (task.dueDate) {
      const date = document.createElement("span");
      date.textContent = `Due: ${task.dueDate}`;
      meta.appendChild(date);
    }

    content.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.className = "action-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(editButton, deleteButton);
    item.append(checkbox, content, actions);
    taskList.appendChild(item);
  });

  updateStats();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) {
    taskInput.focus();
    return;
  }

  if (taskId.value) {
    const task = tasks.find(item => item.id === taskId.value);

    if (task) {
      task.title = title;
      task.priority = priorityInput.value;
      task.dueDate = dueDateInput.value;
    }
  } else {
    tasks.unshift({
      id: crypto.randomUUID(),
      title,
      priority: priorityInput.value,
      dueDate: dueDateInput.value,
      completed: false
    });
  }

  saveTasks();
  resetForm();
  renderTasks();
});

function toggleTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  taskId.value = task.id;
  taskInput.value = task.title;
  priorityInput.value = task.priority;
  dueDateInput.value = task.dueDate || "";

  document.getElementById("formTitle").textContent = "Edit Task";
  document.getElementById("submitBtn").textContent = "Save Changes";
  document.getElementById("cancelEdit").classList.remove("hidden");

  taskInput.focus();
  document.querySelector(".task-panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function deleteTask(id) {
  const confirmed = confirm("Are you sure you want to delete this task?");
  if (!confirmed) return;

  tasks = tasks.filter(task => task.id !== id);

  if (taskId.value === id) resetForm();

  saveTasks();
  renderTasks();
}

function resetForm() {
  taskForm.reset();
  taskId.value = "";
  priorityInput.value = "Medium";

  document.getElementById("formTitle").textContent = "Add New Task";
  document.getElementById("submitBtn").textContent = "+ Add Task";
  document.getElementById("cancelEdit").classList.add("hidden");
}

document.getElementById("cancelEdit").addEventListener("click", resetForm);

searchInput.addEventListener("input", renderTasks);

document.getElementById("filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  currentFilter = button.dataset.filter;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn === button);
  });

  renderTasks();
});

document.getElementById("clearCompleted").addEventListener("click", () => {
  const completedCount = tasks.filter(task => task.completed).length;

  if (completedCount === 0) {
    alert("There are no completed tasks to clear.");
    return;
  }

  if (!confirm(`Delete ${completedCount} completed task(s)?`)) return;

  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();