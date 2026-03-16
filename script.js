// ---------- LOCAL VARIABLES AND ARRAYS ---------- //
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let labels = JSON.parse(localStorage.getItem("labels")) || [];
let projects = JSON.parse(localStorage.getItem("projects")) || [{ id: "inbox", title: "Inbox" }];
let todosLabelsLinker = JSON.parse(localStorage.getItem("todosLabelsLinker")) || [];


// ---------- DOM VARIABLES ---------- //
let addTodosContainer = document.getElementById("add-todos-container");
let todosInProgressList = document.getElementById("todos-in-progress-list");
let completedTodosList = document.getElementById("completed-todos-list");
let newLabelInputBox = document.getElementById("new-label-input");
let labelsList = document.getElementById("labels-list");
let newTodoInputBox = document.getElementById("new-todo-input");
let newTodoDescriptionBox = document.getElementById("new-todo-description");
let dateInputBox = document.getElementById("date-input");
let searchBar = document.getElementById("search-bar");
let labelsBox = document.getElementById("labels-box");
let projectSelectBox = document.getElementById("project-select");
let newProjectBox = document.getElementById("new-project-box");
let newProjectInput = document.getElementById("new-project-input");
let showProjectInputBtn = document.getElementById("show-project-input-btn");
let projectListElement = document.getElementById("project-list");
let currentProjectHeading = document.getElementById("current-project-heading");
let prioritySelectBox = document.getElementById("priority-select");
let sortSelectBox = document.getElementById("sort-select");
let themeToggleBtn = document.getElementById("theme-toggle-btn");


// ---------- STATE VARIABLES ---------- //
let currentProjectId = "all";
let currentSortMode = "manual";
let draggedTodoId = null;
let editId = null;
let editingSubtaskId = null;
let isDarkMode = localStorage.getItem("darkMode") === "true";


// ---------- LOCAL STORAGE ---------- //
let saveToLocalStorage = () => {
    labels = labels.filter(label => label && label.id && label.title);
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("labels", JSON.stringify(labels));
    localStorage.setItem("todosLabelsLinker", JSON.stringify(todosLabelsLinker));
    localStorage.setItem("projects", JSON.stringify(projects));
};


// ---------- UTILITY HELPERS ---------- //
let isOverdue = (dateString) => {
    if (!dateString) return false;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let [year, month, day] = dateString.split('-');
    let taskDate = new Date(year, month - 1, day);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
};

let formatDisplayDate = (dateString) => {
    if (!dateString) return '';

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let [year, month, day] = dateString.split('-');
    let taskDate = new Date(year, month - 1, day);
    taskDate.setHours(0, 0, 0, 0);

    let timeDiff = taskDate.getTime() - today.getTime();
    let diffDays = Math.round(timeDiff / (1000 * 3600 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";

    let options = { month: 'short', day: 'numeric' };
    if (taskDate.getFullYear() !== today.getFullYear()) {
        options.year = 'numeric';
    }

    return taskDate.toLocaleDateString(undefined, options);
};

let getPriorityClass = (priority) => {
    if (priority === 'p1') return 'p1-text';
    if (priority === 'p2') return 'p2-text';
    if (priority === 'p3') return 'p3-text';
    return '';
};

let getPriorityIcon = (priority) => {
    if (priority === 'p1') return '<span style="color: #d1453b; font-size: 12px; margin-left: 5px;">🚩 P1</span>';
    if (priority === 'p2') return '<span style="color: #eb8909; font-size: 12px; margin-left: 5px;">🚩 P2</span>';
    if (priority === 'p3') return '<span style="color: #246fe0; font-size: 12px; margin-left: 5px;">🚩 P3</span>';
    return '';
};

let getLabelsForTodo = todoId => {
    let links = todosLabelsLinker.filter(link => link.todoId === todoId);
    let labelsHtml = links.map(link => {
        let labelObject = labels.find(label => label.id === link.labelId);
        if (labelObject) {
            return `<span class="label-badge">${labelObject.title}</span>`;
        }
        return null;
    });
    return labelsHtml.filter(Boolean).join("");
};


// ---------- TEMPLATES ---------- //
let labelTemplate = item => `
    <input type="checkbox" class="label-checkbox" onchange="toggleLabels('${item.id}')" ${item.selected ? 'checked' : ''}>
    <span>${item.title || 'Untitled'}</span>
    <button class="delete-label-btn" onclick="deleteLabels('${item.id}')">&times;</button>
`;

let todoTemplate = item => `
    <div style="display: flex; align-items: center; gap: 5px;">
        <input type="checkbox" class="todo-checkbox" onchange="toggleTodo('${item.id}')" ${item.completed ? 'checked' : ''}>
        
        <span class="todo-title ${item.completed ? 'completed-todo-text' : ''} ${getPriorityClass(item.priority)}">
            ${item.title}
        </span>
        
        ${getPriorityIcon(item.priority)}
        <span class="todo-date ${item.dueDate && isOverdue(item.dueDate) && !item.completed ? 'overdue-text' : ''}" style="margin-left: auto;">
            ${formatDisplayDate(item.dueDate)}
        </span>
        <button class="edit-todo-btn" onclick="prepareEdit('${item.id}')" style="margin-left: 10px;">Edit</button>
        <button class="delete-todo-btn" onclick="deleteTodo('${item.id}')">&times;</button>
    </div>
    
    <div class="todo-description" style="padding-left: 25px;">${item.description || ''}</div>
    <div class="todo-labels-container" style="padding-left: 25px;">${getLabelsForTodo(item.id)}</div>
    
    ${renderSubtasksHTML(item)}
`;


// ---------- RENDER ---------- //
let render = (arr, container, templateCallback, emptyMessage = "Nothing here yet.") => {
    container.innerHTML = "";
    if (arr.length === 0) {
        let emptyDiv = document.createElement("div");
        emptyDiv.style.textAlign = "center";
        emptyDiv.style.color = "gray";
        emptyDiv.style.padding = "20px";
        emptyDiv.style.fontStyle = "italic";
        emptyDiv.innerText = emptyMessage;
        container.appendChild(emptyDiv);
        return;
    }

    arr.forEach(element => {
        let newItem = document.createElement("li");
        newItem.innerHTML = templateCallback(element);
        newItem.id = element.id;

        if (currentSortMode === 'manual') {
            newItem.draggable = true;
            newItem.classList.add("draggable-item");

            newItem.addEventListener("dragstart", () => {
                draggedTodoId = element.id;
                newItem.classList.add("dragging");
            });

            newItem.addEventListener("dragend", () => {
                newItem.classList.remove("dragging");
                saveNewOrder(container);
            });

            newItem.addEventListener("dragover", (e) => {
                e.preventDefault();
                let draggingItem = document.querySelector(".dragging");
                if (!draggingItem) return;

                let siblings = [...container.querySelectorAll(".draggable-item:not(.dragging)")];
                let nextSibling = siblings.find(sibling => {
                    return e.clientY <= sibling.getBoundingClientRect().top + sibling.offsetHeight / 2;
                });

                container.insertBefore(draggingItem, nextSibling);
            });
        } else {
            newItem.draggable = false;
            newItem.style.cursor = "default";
        }

        container.appendChild(newItem);
    });
};

let renderAllTodos = () => {
    if (currentProjectId === 'all') {
        currentProjectHeading.innerText = "All Tasks";
    } else if (currentProjectId === 'today') {
        currentProjectHeading.innerText = "Today";
    } else if (currentProjectId === 'upcoming') {
        currentProjectHeading.innerText = "Upcoming";
    } else {
        let activeProject = projects.find(p => p.id === currentProjectId);
        currentProjectHeading.innerText = activeProject ? activeProject.title : "Inbox";
    }

    let filteredTodos = todos;

    if (currentProjectId === 'today') {
        let today = new Date();
        let year = today.getFullYear();
        let month = String(today.getMonth() + 1).padStart(2, '0');
        let day = String(today.getDate()).padStart(2, '0');
        let todayString = `${year}-${month}-${day}`;

        filteredTodos = todos.filter(todo => todo.dueDate === todayString);

    } else if (currentProjectId === 'upcoming') {
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        let nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        filteredTodos = todos.filter(todo => {
            if (!todo.dueDate) return false;

            let [year, month, day] = todo.dueDate.split('-');
            let taskDate = new Date(year, month - 1, day);
            taskDate.setHours(0, 0, 0, 0);

            return taskDate >= today && taskDate <= nextWeek;
        });

    } else if (currentProjectId !== 'all') {
        filteredTodos = todos.filter(todo => {
            let pId = todo.projectId || "inbox";
            return pId === currentProjectId;
        });
    }

    let searchText = searchBar.value.trim().toLowerCase();
    if (searchText) {
        filteredTodos = filteredTodos.filter(todo =>
            todo.title.toLowerCase().includes(searchText) ||
            (todo.description && todo.description.toLowerCase().includes(searchText))
        );
    }

    let inProgressTodos = filteredTodos.filter(todo => todo.completed === false);
    let completedTodos = filteredTodos.filter(todo => todo.completed === true);

    if (currentSortMode === 'priority') {
        let prioritySort = (a, b) => {
            let pA = a.priority || "p4";
            let pB = b.priority || "p4";
            if (pA !== pB) return pA.localeCompare(pB);

            let dA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            let dB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dA - dB;
        };
        inProgressTodos.sort(prioritySort);
        completedTodos.sort(prioritySort);

    } else if (currentSortMode === 'date') {
        let dateSort = (a, b) => {
            let dA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            let dB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dA - dB;
        };
        inProgressTodos.sort(dateSort);
        completedTodos.sort(dateSort);

    } else if (currentSortMode === 'alpha') {
        let alphaSort = (a, b) => a.title.localeCompare(b.title);
        inProgressTodos.sort(alphaSort);
        completedTodos.sort(alphaSort);
    }

    render(inProgressTodos, todosInProgressList, todoTemplate, "☕ All caught up! Enjoy your day.");
    render(completedTodos, completedTodosList, todoTemplate, "No completed tasks yet.");
};

let renderProjectsDropdown = () => {
    projectSelectBox.innerHTML = "";
    projects.forEach(proj => {
        let option = document.createElement("option");
        option.value = proj.id;
        option.innerText = proj.title;
        projectSelectBox.appendChild(option);
    });
};

let renderSidebarProjects = () => {
    projectListElement.innerHTML = "";

    let allItem = document.createElement("li");
    allItem.className = `project-item ${currentProjectId === 'all' ? 'active-project' : ''}`;
    allItem.innerText = "📥 All Tasks";
    allItem.onclick = () => selectProject('all');
    projectListElement.appendChild(allItem);

    let todayItem = document.createElement("li");
    todayItem.className = `project-item ${currentProjectId === 'today' ? 'active-project' : ''}`;
    todayItem.innerText = "⭐ Today";
    todayItem.onclick = () => selectProject('today');
    projectListElement.appendChild(todayItem);

    let upcomingItem = document.createElement("li");
    upcomingItem.className = `project-item ${currentProjectId === 'upcoming' ? 'active-project' : ''}`;
    upcomingItem.innerText = "📅 Upcoming";
    upcomingItem.onclick = () => selectProject('upcoming');
    projectListElement.appendChild(upcomingItem);

    projects.forEach(proj => {
        let li = document.createElement("li");
        li.className = `project-item ${currentProjectId === proj.id ? 'active-project' : ''}`;
        li.onclick = () => selectProject(proj.id);

        let titleSpan = document.createElement("span");
        titleSpan.innerText = `📁 ${proj.title}`;
        li.appendChild(titleSpan);

        if (proj.id !== "inbox") {
            let delBtn = document.createElement("button");
            delBtn.innerHTML = "&times;";
            delBtn.className = "delete-project-btn";
            delBtn.onclick = (e) => deleteProject(e, proj.id);
            li.appendChild(delBtn);
        }

        projectListElement.appendChild(li);
    });
};

let renderSubtasksHTML = (todo) => {
    let subtasks = todo.subtasks || [];

    let html = `<ul class="subtasks-list" style="list-style-type: none; padding-left: 25px; margin-top: 8px; margin-bottom: 8px;">`;

    subtasks.forEach(sub => {
        if (editingSubtaskId === sub.id) {
            html += `
                <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <input type="text" id="edit-subtask-input-${sub.id}" value="${sub.title}" style="font-size: 13px; padding: 3px; flex-grow: 1; border: 1px solid #ccc; border-radius: 3px;">
                    <button onclick="saveEditSubtask('${todo.id}', '${sub.id}')" style="font-size: 12px; padding: 3px 6px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 3px;">Save</button>
                    <button onclick="cancelEditSubtask()" style="font-size: 12px; padding: 3px 6px; cursor: pointer; background: #ccc; border: none; border-radius: 3px;">Cancel</button>
                </li>
            `;
        } else {
            html += `
                <li style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <input type="checkbox" onchange="toggleSubtask('${todo.id}', '${sub.id}')" ${sub.completed ? 'checked' : ''}>
                    
                    <span class="${sub.completed ? 'completed-todo-text' : ''}" style="font-size: 13px; color: #555; flex-grow: 1;">${sub.title}</span>
                    
                    <button onclick="prepareEditSubtask('${sub.id}')" style="background:none; border:none; color:blue; cursor:pointer; font-size: 12px;">Edit</button>
                    <button onclick="deleteSubtask('${todo.id}', '${sub.id}')" style="background:none; border:none; color:red; cursor:pointer; font-size: 14px;">&times;</button>
                </li>
            `;
        }
    });

    html += `
        <li style="margin-top: 5px; display: flex; gap: 5px;">
            <input type="text" id="subtask-input-${todo.id}" placeholder="Add subtask..." style="font-size: 12px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; flex-grow: 1;">
            <button onclick="addSubtask('${todo.id}')" style="font-size: 12px; padding: 4px 8px; cursor: pointer;">Add</button>
        </li>
    </ul>`;

    return html;
};


// ---------- SORT ---------- //
let changeSortMode = () => {
    currentSortMode = sortSelectBox.value;
    renderAllTodos();
};

let saveNewOrder = (container) => {
    let visibleIds = [...container.querySelectorAll(".draggable-item")].map(li => li.id);

    todos.sort((a, b) => {
        let indexA = visibleIds.indexOf(a.id);
        let indexB = visibleIds.indexOf(b.id);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        return 0;
    });

    saveToLocalStorage();
};


// ---------- TODOS ---------- //
let addTodo = () => {
    let newTodo = newTodoInputBox.value.trim();
    if (!newTodo) return;

    if (editId) {
        let todo = todos.find(t => t.id === editId);
        todo.title = newTodo;
        todo.description = newTodoDescriptionBox.value || "";
        todo.dueDate = dateInputBox.value || "";
        todo.projectId = projectSelectBox.value;
        todosLabelsLinker = todosLabelsLinker.filter(link => link.todoId !== editId);
        labels.forEach(label => {
            if (label.selected) {
                todosLabelsLinker.push({ labelId: label.id, todoId: editId });
            }
        });

        editId = null;
        document.getElementById("add-todo-button").innerText = "Add Todo";
    } else {
        let newTodoId = uuid.v4();
        todos.push({
            id: newTodoId,
            title: newTodo,
            description: newTodoDescriptionBox.value || "",
            completed: false,
            dueDate: dateInputBox.value || "",
            projectId: projectSelectBox.value || "inbox",
            priority: prioritySelectBox.value || "p4"
        });

        labels.forEach(label => {
            if (label.selected) {
                todosLabelsLinker.push({ labelId: label.id, todoId: newTodoId });
            }
        });
    }
    saveToLocalStorage();
    resetUI();
    renderAllTodos();
};

let toggleTodo = (id) => {
    let todo = todos.find(todo => todo.id == id);
    if (todo) {
        todo.completed = !todo.completed;
    }
    saveToLocalStorage();
    renderAllTodos();
};

let deleteTodo = (id) => {
    todos = todos.filter(todo => todo.id !== id);
    todosLabelsLinker = todosLabelsLinker.filter(link => link.todoId !== id);
    saveToLocalStorage();
    renderAllTodos();
};

let clearCompleted = () => {
    if (confirm("Are you sure you want to permanently delete all completed tasks?")) {
        todos = todos.filter(todo => !todo.completed);

        let remainingTodoIds = todos.map(t => t.id);
        todosLabelsLinker = todosLabelsLinker.filter(link => remainingTodoIds.includes(link.todoId));

        saveToLocalStorage();
        renderAllTodos();
    }
};

let prepareEdit = (id) => {
    let todo = todos.find(t => t.id === id);
    if (todo) {
        projectSelectBox.value = todo.projectId || "inbox";
        newTodoInputBox.value = todo.title;
        newTodoDescriptionBox.value = todo.description || "";
        dateInputBox.value = todo.dueDate || "";
        prioritySelectBox.value = todo.priority || "p4";
        editId = id;
        document.getElementById("add-todo-button").innerText = "Update Todo";

        let currentLabelLinks = todosLabelsLinker.filter(link => link.todoId === id);
        labels.forEach(label => {
            label.selected = currentLabelLinks.some(link => link.labelId === label.id);
        });

        if (currentLabelLinks.length > 0) {
            labelsBox.style.display = "block";
        } else {
            labelsBox.style.display = "none";
        }
        render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
        addTodosContainer.style.display = "block";
    }
};

let toggleAddTodoSection = () => {
    resetUI();
    if (currentProjectId !== 'all' && currentProjectId !== 'today' && currentProjectId !== 'upcoming') {
        projectSelectBox.value = currentProjectId;
    } else {
        projectSelectBox.value = "inbox";
    }
    addTodosContainer.style.display = "block";
};


// ---------- SUBTASKS ---------- //
let addSubtask = (parentId) => {
    let input = document.getElementById(`subtask-input-${parentId}`);
    let title = input.value.trim();

    if (title) {
        let parentTodo = todos.find(t => t.id === parentId);

        if (!parentTodo.subtasks) parentTodo.subtasks = [];

        parentTodo.subtasks.push({
            id: uuid.v4(),
            title: title,
            completed: false
        });

        saveToLocalStorage();
        renderAllTodos();
    }
};

let toggleSubtask = (parentId, subtaskId) => {
    let parentTodo = todos.find(t => t.id === parentId);
    if (parentTodo && parentTodo.subtasks) {
        let subtask = parentTodo.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            saveToLocalStorage();
            renderAllTodos();
        }
    }
};

let deleteSubtask = (parentId, subtaskId) => {
    let parentTodo = todos.find(t => t.id === parentId);
    if (parentTodo && parentTodo.subtasks) {
        parentTodo.subtasks = parentTodo.subtasks.filter(s => s.id !== subtaskId);
        saveToLocalStorage();
        renderAllTodos();
    }
};

let prepareEditSubtask = (subtaskId) => {
    editingSubtaskId = subtaskId;
    renderAllTodos();
};

let saveEditSubtask = (parentId, subtaskId) => {
    let input = document.getElementById(`edit-subtask-input-${subtaskId}`);
    let newTitle = input.value.trim();

    if (newTitle) {
        let parentTodo = todos.find(t => t.id === parentId);
        if (parentTodo && parentTodo.subtasks) {
            let subtask = parentTodo.subtasks.find(s => s.id === subtaskId);
            if (subtask) {
                subtask.title = newTitle;
                saveToLocalStorage();
            }
        }
    }

    editingSubtaskId = null;
    renderAllTodos();
};

let cancelEditSubtask = () => {
    editingSubtaskId = null;
    renderAllTodos();
};


// ---------- LABELS ---------- //
let addLabels = () => {
    let newLabelText = newLabelInputBox.value.trim();
    if (newLabelText) {
        labels.push({ id: uuid.v4(), title: newLabelText, selected: false });
        saveToLocalStorage();
    }
    newLabelInputBox.value = "";
    console.log(labels);
    render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
};

let toggleLabels = (id) => {
    let label = labels.find(label => label.id == id);
    if (label) {
        label.selected = !label.selected;
    }
    saveToLocalStorage();
    render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
};

let deleteLabels = (id) => {
    labels = labels.filter(label => label.id != id);
    todosLabelsLinker = todosLabelsLinker.filter(link => link.labelId != id);
    saveToLocalStorage();
    render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
    renderAllTodos();
};

let toggleLabelSection = () => {
    if (labelsBox.style.display === "none" || labelsBox.style.display === "") {
        labelsBox.style.display = "block";
    } else {
        labelsBox.style.display = "none";
    }
};


// ---------- PROJECTS ---------- //
let selectProject = (id) => {
    currentProjectId = id;
    resetUI();
    renderSidebarProjects();
    renderAllTodos();
};

let createNewProject = () => {
    let title = newProjectInput.value.trim();
    if (title) {
        let newProj = { id: uuid.v4(), title: title };
        projects.push(newProj);
        saveToLocalStorage();

        renderProjectsDropdown();
        projectSelectBox.value = newProj.id;

        toggleNewProjectBox();
    }
};

let deleteProject = (event, id) => {
    event.stopPropagation();

    if (confirm("Are you sure you want to delete this project? Its tasks will be moved to your Inbox.")) {
        projects = projects.filter(p => p.id !== id);
        todos.forEach(todo => {
            if (todo.projectId === id) {
                todo.projectId = "inbox";
            }
        });

        if (currentProjectId === id) {
            currentProjectId = "all";
        }

        saveToLocalStorage();
        renderProjectsDropdown();
        renderSidebarProjects();
        renderAllTodos();
    }
};

let toggleNewProjectBox = () => {
    if (newProjectBox.style.display === "none" || newProjectBox.style.display === "") {
        newProjectBox.style.display = "flex";
        showProjectInputBtn.style.display = "none";
        newProjectInput.focus();
    } else {
        newProjectBox.style.display = "none";
        showProjectInputBtn.style.display = "inline-block";
        newProjectInput.value = "";
    }
};


// ---------- THEME ---------- //
let applyTheme = () => {
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        if (themeToggleBtn) themeToggleBtn.innerText = "☀️ Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        if (themeToggleBtn) themeToggleBtn.innerText = "🌙 Dark Mode";
    }
};

let toggleTheme = () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem("darkMode", isDarkMode);
    applyTheme();
};


// ---------- RESET AND CANCEL ---------- //
let resetUI = () => {
    editId = null;
    newTodoInputBox.value = "";
    newTodoDescriptionBox.value = "";
    dateInputBox.value = "";
    document.getElementById("add-todo-button").innerText = "Add Todo";
    labels.forEach(label => label.selected = false);
    render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
    addTodosContainer.style.display = "none";
    labelsBox.style.display = "none";
    prioritySelectBox.value = "p4";

    if (newProjectBox) {
        newProjectBox.style.display = "none";
        showProjectInputBtn.style.display = "inline-block";
        newProjectInput.value = "";
    }
};

let cancelEdit = () => {
    resetUI();
};


// ---------- REMINDERS ---------- //
let reminderCheck = () => {
    setInterval(() => {
        let now = new Date();
        let needsSaving = false;

        todos.forEach(todo => {
            if (!todo.completed && todo.dueDate && !todo.notified) {
                let dueDate = new Date(todo.dueDate);
                let oneDayBefore = new Date(dueDate.getTime() - (24 * 60 * 60 * 1000));
                if (now >= oneDayBefore) {
                    alert(`⏰ Reminder: Your task "${todo.title}" is due tomorrow!`);
                    todo.notified = true;
                    needsSaving = true;
                }
            }
        });
        if (needsSaving) {
            saveToLocalStorage();
        }
    }, 60000);
};


// ---------- SEARCH ---------- //
searchBar.addEventListener("input", () => {
    renderAllTodos();
});


// ---------- KEYBOARD SHORTCUTS ---------- //
document.addEventListener('keydown', (e) => {

    if (e.key === 'Escape') {
        cancelEdit();
        return;
    }

    let isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
    if (isTyping) return;

    if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();

        if (currentProjectId !== 'all' && currentProjectId !== 'today' && currentProjectId !== 'upcoming') {
            projectSelectBox.value = currentProjectId;
        } else {
            projectSelectBox.value = "inbox";
        }

        addTodosContainer.style.display = "block";
        newTodoInputBox.focus();
    }

    if (e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        searchBar.focus();
    }
});

[newTodoInputBox, newTodoDescriptionBox].forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addTodo();
        }
    });
});

newLabelInputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addLabels();
    }
});


// ---------- N8N SMART CATEGORIZATION ---------- //
const N8N_WEBHOOK_URL = "https://tower-presented-empty-rack.trycloudflare.com/webhook/categorize-task";

let showAutoFillToast = (message, isError = false) => {
    let existing = document.getElementById("autofill-toast");
    if (existing) existing.remove();

    let toast = document.createElement("div");
    toast.id = "autofill-toast";
    toast.innerText = message;
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        padding: "10px 18px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#fff",
        background: isError ? "#ef4444" : "#22c55e",
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        zIndex: "9999",
        opacity: "1",
        transition: "opacity 0.4s ease"
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

let flashElement = (el) => {
    el.style.transition = "box-shadow 0.15s ease";
    el.style.boxShadow = "0 0 0 3px rgba(34, 197, 94, 0.55)";
    setTimeout(() => { el.style.boxShadow = ""; }, 1400);
};

let categorizeWithN8n = async () => {
    let taskText = newTodoInputBox.value.trim();
    if (!taskText) {
        showAutoFillToast("✏️ Type a task name first.", true);
        return;
    }

    let magicBtn = document.querySelector('button[onclick="categorizeWithN8n()"]');
    let originalText = magicBtn.innerText;
    magicBtn.innerText = "⏳ Thinking...";
    magicBtn.disabled = true;

    let oldPreview = document.getElementById("subtask-preview");
    if (oldPreview) oldPreview.remove();
    pendingSubtasks = [];

    try {
        let payload = {
            task: taskText,
            availableProjects: JSON.stringify(projects.map(p => ({ id: p.id, title: p.title })))
        };

        let response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errText = await response.text().catch(() => response.statusText);
            throw new Error(`n8n responded ${response.status}: ${errText}`);
        }

        let ai = await response.json();
        let filled = [];

        if (ai.projectId && projects.find(p => p.id === ai.projectId)) {
            projectSelectBox.value = ai.projectId;
            flashElement(projectSelectBox);
            filled.push("project");
        }

        if (ai.priority && ["p1", "p2", "p3", "p4"].includes(ai.priority)) {
            prioritySelectBox.value = ai.priority;
            flashElement(prioritySelectBox);
            filled.push("priority");
        }

        if (ai.description && ai.description.trim()) {
            newTodoDescriptionBox.value = ai.description.trim();
            flashElement(newTodoDescriptionBox);
            filled.push("description");
        }

        if (Array.isArray(ai.labels) && ai.labels.length > 0) {
            labels.forEach(l => l.selected = false);
            ai.labels.forEach(labelTitle => {
                let title = labelTitle.trim();
                if (!title) return;
                let existing = labels.find(l => l.title.toLowerCase() === title.toLowerCase());
                if (!existing) {
                    existing = { id: uuid.v4(), title, selected: false };
                    labels.push(existing);
                }
                existing.selected = true;
            });
            saveToLocalStorage();
            labelsBox.style.display = "block";
            render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
            filled.push("labels");
        }

    } catch (error) {
        console.error("Auto-Fill failed:", error);
        let isOffline = error.message.includes("Failed to fetch") || error.message.includes("NetworkError");
        showAutoFillToast(
            isOffline
                ? "⚠️ Can't reach n8n — is it running on port 5678?"
                : "⚠️ " + error.message,
            true
        );
    } finally {
        magicBtn.innerText = originalText;
        magicBtn.disabled = false;
    }
};


// ---------- INITIALIZATION ---------- //
renderProjectsDropdown();
renderSidebarProjects();
reminderCheck();
applyTheme();
render(labels, labelsList, labelTemplate, "🏷️ No labels created yet.");
renderAllTodos();