const TASKS = [
  {
    text: "Find out where Soul Stone is",
    colId: "todoCol",
  },
  {
    text: "Collect Time Stone from Dr. Strange",
    colId: "todoCol",
  },
  {
    text: "Collect Mind Stone from Vision",
    colId: "todoCol",
  },
  {
    text: "Collect Reality Stone from the Collector",
    colId: "inProgressCol",
  },
];

const addTask = (column, text) => {
  if (!column) return;

  const removeBtn = document.createElement("button");
  removeBtn.innerHTML = `<img src="./delete-bin-line.svg" alt="Delete bin image" />`;
  removeBtn.classList.add("remove");

  const taskText = document.createElement("span");
  taskText.textContent = text;
  taskText.classList.add("text");

  const taskLi = document.createElement("li");
  taskLi.classList.add("task");
  taskLi.draggable = true;
  taskLi.append(taskText, removeBtn);

  column.querySelector(".tasks").append(taskLi);

  const taskCount = column.querySelectorAll(".task").length;
  column.querySelector(".col-tag").textContent = `${taskCount} items`;

  removeBtn.addEventListener("click", (evnt) => {
    taskLi.remove();
    const taskCount = column.querySelectorAll(".task").length;
    column.querySelector(".col-tag").textContent = `${taskCount} items`;
  });

  // Drag and Drop Feature Code

  taskLi.addEventListener("dragstart", (evnt) => {
    taskLi.id = "draggedTask";
    taskLi.classList.add("dragging");
    evnt.dataTransfer.effectAllowed = "move";
    // custom data for detecting valid drop
    evnt.dataTransfer.setData("task", "");
  });

  taskLi.addEventListener("dragend", (evnt) => {
    taskLi.removeAttribute("id");
    taskLi.classList.remove("dragging");
  });
};

const columnIdList = ["todoCol", "inProgressCol", "doneCol"];

const createPlaceholder = (taskElm) => {
  const placeholder = document.createElement("li");
  placeholder.classList.add("task-placeholder");
  placeholder.id = "taskPlaceholder";
  placeholder.style.height = `${taskElm.offsetHeight}px`;

  return placeholder;
};

const movePlaceholder = (column, axisY) => {
  const draggedTask = document.getElementById("draggedTask");
  const taskList = column.querySelector("#taskList");
  const tasks = taskList.querySelectorAll("li");
  const existingPlaceholder = document.getElementById("taskPlaceholder");

  if (tasks.length === 0) return;

  if (existingPlaceholder) {
    const { top, bottom } = existingPlaceholder.getBoundingClientRect();
    if (top <= axisY && bottom >= axisY) return;
  }

  for (const task of tasks) {
    if (task.getBoundingClientRect().bottom >= axisY) {
      if (task === existingPlaceholder) return;

      existingPlaceholder?.remove();

      if (task === draggedTask || task.previousElementSibling === draggedTask)
        return;

      taskList.insertBefore(
        existingPlaceholder ?? createPlaceholder(draggedTask),
        task,
      );
      return;
    }
  }

  existingPlaceholder?.remove();

  if (taskList.lastElementChild === draggedTask) return;

  taskList.append(existingPlaceholder ?? createPlaceholder(draggedTask));
};

for (const columnId of columnIdList) {
  const taskColumn = document.getElementById(columnId);

  TASKS.filter((task) => task.colId === columnId).forEach((task) => {
    addTask(taskColumn, task.text);
  });

  taskColumn.querySelector("#addTaskBtn").addEventListener("click", (evnt) => {
    const taskInput = taskColumn.querySelector("#taskInput");
    const value = taskInput.value;

    if (value.trim() === "") return;

    addTask(taskColumn, value);

    taskInput.value = "";
  });

  // Drag and Drop Feature Code

  taskColumn.addEventListener("dragover", (evnt) => {
    if (!evnt.dataTransfer.types.includes("task")) return;
    evnt.preventDefault();

    taskColumn.classList.add("drag-over");

    movePlaceholder(taskColumn, evnt.clientY);
  });

  taskColumn.addEventListener("dragleave", (evnt) => {
    if (!evnt.dataTransfer.types.includes("task")) return;
    evnt.preventDefault();

    taskColumn.classList.remove("drag-over");

    if (taskColumn.contains(evnt.relatedTarget)) return;

    document.getElementById("taskPlaceholder")?.remove();
  });

  taskColumn.addEventListener("drop", (evnt) => {
    if (!evnt.dataTransfer.types.includes("task")) return;
    evnt.preventDefault();

    taskColumn.classList.remove("drag-over");

    const draggedTask = document.getElementById("draggedTask");
    const taskList = taskColumn.querySelector("#taskList");

    if (taskList.querySelectorAll("li.task").length) {
      const taskPlaceholder = document.getElementById("taskPlaceholder");

      if (!taskPlaceholder) return;

      taskPlaceholder.replaceWith(draggedTask);
    } else {
      taskList.append(draggedTask);
    }
  });
}
