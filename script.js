const columns = {
  todos: {
    title: "Todo's",
    tasks: [
      {
        text: "Implement task card rendering",
        timestamp: 1794822841911,
      },
      {
        text: "Implement create and delete operation",
        timestamp: 1794822841906,
      },
    ],
  },
  inprogress: { title: "In Progress", tasks: [] },
  inreview: { title: "In Review", tasks: [] },
  done: { title: "Done", tasks: [] },
};

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
    if (!Object.hasOwn(attr, key)) continue;

    const value = attr[key];

    if (elm.hasOwnProperty(key)) {
      elm[key] = value;
    } else {
      elm.setAttribute(key, value);
    }
  }

  return elm;
};

const formateTimestamp = (timestamp) => {
  const inputDate = new Date(timestamp);
  const today = new Date();

  const isToday =
    inputDate.getDate() === today.getDate() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return "Today";
  }

  inputDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const createCards = (tasks) => {
  if (!tasks.length) return null;

  return tasks.map(({ text, timestamp }) => {
    const cardText = createElement({
      elmName: "p",
      children: text,
      class: "task-text",
    });
    const cardDate = createElement({
      elmName: "span",
      children: formateTimestamp(timestamp),
      class: "task-date",
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
    });

    const cardFooter = createElement({
      children: [cardDate, removeBtn],
      class: "task-footer",
    });

    const card = createElement({
      elmName: "article",
      children: [cardText, cardFooter],
      class: "task-card",
      id: timestamp,
    });

    return card;
  });
};

const renderColumn = ({ id, title, tasks }) => {
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
    children: createCards(tasks) ?? emptyPlaceholder,
    class: "col-body",
  });

  const input = createElement({
    elmName: "input",
    class: "task-input",
    type: "text",
    name: `${id}-input`,
    id: `${id}Input`,
    placeholder: "type here...",
  });
  const button = createElement({
    elmName: "button",
    children: "Add Task",
    class: "add-btn",
  });
  const colFooter = createElement({
    children: [input, button],
    class: "col-footer",
  });

  const column = createElement({
    elmName: "section",
    children: [colHeader, colBody, colFooter],
    class: "column",
    id,
  });

  const board = document.querySelector("#kanbanBoard");

  const oldColumn = board.querySelector(`#${id}`);

  if (board.contains(oldColumn)) {
    oldColumn.replaceWith(column);
  } else {
    board.appendChild(column);
  }
};

for (const key in columns) {
  if (!Object.hasOwn(columns, key)) continue;

  const { title, tasks } = columns[key];

  renderColumn({ id: key, title, tasks });
}
