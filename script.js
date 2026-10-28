const TASKS = [
  {
    text: "Review project specifications",
    colId: "todoCol",
  },
  {
    text: "Implement database schema updates",
    colId: "inProgressCol",
  },
  {
    text: "Review project specifications",
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

  removeBtn.addEventListener("click", (evt) => {
    taskLi.remove();
    const taskCount = column.querySelectorAll(".task").length;
    column.querySelector(".col-tag").textContent = `${taskCount} items`;
  });
};

const columnIdList = ["todoCol", "inProgressCol", "doneCol"];

for (const columnId of columnIdList) {
  const taskColumn = document.getElementById(columnId);

  TASKS.filter((task) => task.colId === columnId).forEach((task) => {
    addTask(taskColumn, task.text);
  });

  taskColumn.querySelector("#addTaskBtn").addEventListener("click", (evt) => {
    const taskInput = taskColumn.querySelector("#taskInput");
    const value = taskInput.value;

    if (value.trim() === "") return;

    addTask(taskColumn, value);

    taskInput.value = "";
  });
}
