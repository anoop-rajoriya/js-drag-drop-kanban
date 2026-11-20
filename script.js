const DEFAULT_COLS = {
  todos: {
    title: "Todo's",
    tasks: [
      {
        id: "d24a5ec9-9b54-42c2-9665-e7840afe7f8f",
        text: "Implement task card rendering",
        timestamp: 1794822841911,
      },
      {
        id: "6577feda-ae9a-4317-b1bf-fcc336fa178c",
        text: "Implement create and delete operation",
        timestamp: 1794822841906,
      },
    ],
  },
  inprogress: { title: "In Progress", tasks: [] },
  inreview: { title: "In Review", tasks: [] },
  done: { title: "Done", tasks: [] },
};

const STORAGE_KEY = "kanban-board-state";

let columns = null;

try {
  columns = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_COLS;
} catch (error) {
  console.error("Failed to parse saved board state", error);
  columns = DEFAULT_COLS;
}

const saveState = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));

const createElement = ({ elmName = "div", children = [], ...attr } = {}) => {
  const elm = document.createElement(elmName);

  if (children !== null) {
    if (Array.isArray(children)) {
      elm.append(...children);
    } else {
      elm.append(children);
    }
  }

  for (const key in attr) {
    const value = attr[key];
    if (key in elm && key !== "class" && key !== "style") {
      elm[key] = value;
    } else {
      elm.setAttribute(key, value);
    }
  }

  return elm;
};

const formatTimestamp = (timestamp) => {
  const inputDate = new Date(Number(timestamp));
  const today = new Date();

  const isToday =
    inputDate.getDate() === today.getDate() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return "Today";
  }

  return inputDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const removeTask = (columnId, taskIndex) => {
  if (columnId in columns) {
    columns[columnId].tasks.splice(taskIndex, 1);
    saveState();
    renderColumn(columnId);
  }
};

const onTaskDragStart = (card, event) => {
  card.id = "draggedTask";

  event.dataTransfer.effectAllowed = "move";

  // custom type make me to indentified task drop on drop zone
  event.dataTransfer.setData("task", "");
};

const onTaskDragEnd = (card, event) => {
  card.removeAttribute("id");
  document.getElementById("taskPlaceholder")?.remove();
};

const createCards = (tasks, columnId) => {
  if (!tasks.length) return null;

  return tasks.map(({ text, timestamp }, index) => {
    const cardText = createElement({
      elmName: "p",
      children: text,
      class: "task-text",
    });
    const cardDate = createElement({
      elmName: "time",
      children: formatTimestamp(timestamp),
      class: "task-date",
      dateTime: new Date(Number(timestamp)).toISOString(),
    });
    const binIcon = createElement({
      elmName: "img",
      src: "./assets/delete-bin-line.svg",
      alt: "delete bin icon",
    });
    const removeBtn = createElement({
      elmName: "button",
      children: binIcon,
      class: "remove-btn",
      "aria-label": `Delete task: ${text}`,
    });

    removeBtn.addEventListener("click", (event) => removeTask(columnId, index));

    const cardFooter = createElement({
      children: [cardDate, removeBtn],
      class: "task-footer",
    });

    const card = createElement({
      elmName: "article",
      children: [cardText, cardFooter],
      class: "task-card",
      draggable: true,
    });

    card.addEventListener("dragstart", (event) => onTaskDragStart(card, event));
    card.addEventListener("dragend", (event) => onTaskDragEnd(card, event));

    return card;
  });
};

const addTask = (text, columnId, event) => {
  event.preventDefault();

  if (text.trim() === "") return;
  if (!columns.hasOwnProperty(columnId)) return;

  columns[columnId].tasks.push({
    id: crypto.randomUUID(),
    text: text.trim(),
    timestamp: Date.now(),
  });
  saveState();

  renderColumn(columnId);
  document.getElementById(`${columnId}Input`)?.focus();
};

const makeTaskPlaceholder = (draggedTask) => {
  const placeholder = createElement({
    elmName: "article",
    class: "task-card-placeholder",
    id: "taskPlaceholder",
  });
  placeholder.style.height = `${draggedTask.offsetHeight}px`;
  return placeholder;
};

const onTaskDragover = (column, event) => {
  if (!event.dataTransfer.types.includes("task")) return;

  event.preventDefault();

  if (!column.classList.contains("dragover")) {
    column.classList.add("dragover");
  }

  const existingTaskPlaceholder = document.getElementById("taskPlaceholder");
  const draggedTask = document.getElementById("draggedTask");
  const taskContainer = column.querySelector(".col-body");

  if (existingTaskPlaceholder) {
    if (
      existingTaskPlaceholder.getBoundingClientRect().top <= event.clientY &&
      existingTaskPlaceholder.getBoundingClientRect().bottom >= event.clientY
    )
      return;
  }

  for (const task of taskContainer.children) {
    if (task.getBoundingClientRect().bottom >= event.clientY) {
      if (task === existingTaskPlaceholder) return;
      existingTaskPlaceholder?.remove();

      if (task === draggedTask || task.previousElementSibling === draggedTask)
        return;

      taskContainer.insertBefore(
        existingTaskPlaceholder ?? makeTaskPlaceholder(draggedTask),
        task,
      );
      return;
    }
  }

  existingTaskPlaceholder?.remove();
  if (taskContainer.lastElementChild === draggedTask) return;
  taskContainer.appendChild(
    existingTaskPlaceholder ?? makeTaskPlaceholder(draggedTask),
  );
};

const onTaskDragleave = (column, event) => {
  if (column.contains(event.relatedTarget)) return;

  if (column.classList.contains("dragover")) {
    column.classList.remove("dragover");
  }

  document.getElementById("taskPlaceholder")?.remove();
};

const onTaskDrop = (dropZone, event) => {
  event.preventDefault();

  const emptyPlaceholder = dropZone.querySelector(".empty-placeholder");

  if (!!emptyPlaceholder) emptyPlaceholder.remove();

  const taskPlaceholder = document.getElementById("taskPlaceholder");
  const draggedTask = document.getElementById("draggedTask");

  if (!taskPlaceholder || !draggedTask) return;

  const sourceColId = draggedTask.closest(".column").id;
  const destinationColId = taskPlaceholder.closest(".column").id;

  const taskIndex = [
    ...(document.querySelector(`#${sourceColId} .col-body`)?.children || []),
  ]
    .filter((task) => task.classList.contains("task-card"))
    .findIndex((task) => task === draggedTask);

  const placeholderIndex = [
    ...(document.querySelector(`#${destinationColId} .col-body`)?.children ||
      []),
  ]
    .filter((task) => task !== draggedTask)
    .findIndex((task) => task === taskPlaceholder);

  const { text, timestamp } = columns[sourceColId].tasks[taskIndex];

  columns[sourceColId].tasks.splice(taskIndex, 1);
  columns[destinationColId].tasks.splice(placeholderIndex, 0, {
    text,
    timestamp,
  });
  saveState();

  renderColumn(sourceColId);

  if (sourceColId !== destinationColId) {
    renderColumn(destinationColId);
  }
};

/*
Note: Improvement:
  Currently renderColumn update the whole column ui
  but it can be improved by updating 
  only task counts and tasks (partial update)
*/

function renderColumn(columnId) {
  if (!columns.hasOwnProperty(columnId)) return;

  const { title, tasks } = columns[columnId];

  const colTitle = createElement({
    elmName: "h2",
    children: title,
    class: "col-title",
  });
  const taskCounts = createElement({
    elmName: "span",
    children: tasks.length,
    class: "task-counts",
  });
  const colHeader = createElement({
    children: [colTitle, taskCounts],
    class: "col-header",
  });

  const emptyPlaceholder = createElement({
    children: "Drop Here",
    class: "empty-placeholder",
  });

  const colBody = createElement({
    children: createCards(tasks, columnId) ?? emptyPlaceholder,
    class: "col-body",
  });

  const input = createElement({
    elmName: "input",
    class: "task-input",
    type: "text",
    name: `${columnId}-input`,
    id: `${columnId}Input`,
    placeholder: "type here...",
    "aria-label": `Add task to ${title}`,
  });
  const button = createElement({
    elmName: "button",
    children: "Add Task",
    class: "add-btn",
    type: "submit",
  });

  const colFooter = createElement({
    elmName: "form",
    children: [input, button],
    class: "col-footer",
  });

  colFooter.addEventListener("submit", (event) =>
    addTask(input.value, columnId, event),
  );

  const column = createElement({
    elmName: "section",
    children: [colHeader, colBody, colFooter],
    class: "column",
    id: columnId,
  });

  column.addEventListener("dragover", (event) => onTaskDragover(column, event));
  column.addEventListener("dragleave", (event) =>
    onTaskDragleave(column, event),
  );
  column.addEventListener("drop", (event) => onTaskDrop(colBody, event));

  const board = document.querySelector("#kanbanBoard");

  const oldColumn = board.querySelector(`#${columnId}`);

  if (board.contains(oldColumn)) {
    oldColumn.replaceWith(column);
  } else {
    board.appendChild(column);
  }
}

for (const key in columns) {
  if (!Object.hasOwn(columns, key)) continue;
  renderColumn(key);
}
