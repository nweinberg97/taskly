// Function to initialize drag and drop functionality
function enableDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.task-list');

    // Adding event listeners to task cards for dragging
    taskCards.forEach(task => {
        task.addEventListener('dragstart', () => {
            task.classList.add('dragging');
        });

        task.addEventListener('dragend', () => {
            task.classList.remove('dragging');
            saveSessionData(); // Save the session data when dragging ends
        });
    });

    // Adding event listeners to columns for drag over and drop
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            if (column.children.length === 0) {
                column.appendChild(draggingTask);
            } else {
                const afterElement = getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    column.appendChild(draggingTask);
                } else {
                    column.insertBefore(draggingTask, afterElement);
                }
            }
        });
    });
}

// Function to determine the correct position to insert a dragged task
function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.task-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Function to add a new task to a column
function addTaskToColumn(column) {
    const taskInput = column.querySelector('.task-input');
    const taskList = column.querySelector('.task-list');

    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const newTask = document.createElement('div');
    newTask.classList.add('task-card');
    newTask.setAttribute('draggable', 'true');
    newTask.textContent = taskText;

    // Add the new task to the task list
    taskList.appendChild(newTask);

    // Clear the input field
    taskInput.value = '';

    // Re-enable drag and drop for the new task
    enableDragAndDrop();

    // Save session data
    saveSessionData();
}

// Function to handle adding task when the enter key is pressed
function enableTaskInput() {
    const columns = document.querySelectorAll('.column');

    columns.forEach(column => {
        const addButton = column.querySelector('.add-task-button');
        const taskInput = column.querySelector('.task-input');

        addButton.addEventListener('click', () => addTaskToColumn(column));

        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTaskToColumn(column);
            }
        });
    });
}

// Function to handle trash bin functionality
function enableTrashBin() {
    const trashBin = document.querySelector('.trash-bin');
    const sound = new Audio('sounds/plastic-crunch-83779.mp3'); // Add your path to the sound

    trashBin.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    trashBin.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingTask = document.querySelector('.dragging');
        if (draggingTask) {
            draggingTask.remove();
            sound.play(); // Play sound when task is deleted
            saveSessionData(); // Save session data after deletion
        }
    });
}

// Function to save session data to localStorage
function saveSessionData() {
    const columnsData = {};
    const columns = document.querySelectorAll('.column');
    
    columns.forEach(column => {
        const columnId = column.id;
        const tasks = [...column.querySelectorAll('.task-card')].map(task => task.textContent);
        columnsData[columnId] = tasks;
    });

    localStorage.setItem('tasklyData', JSON.stringify(columnsData));
}

// Function to load session data from localStorage
function loadSessionData() {
    const columnsData = JSON.parse(localStorage.getItem('tasklyData'));

    if (!columnsData) return;

    Object.keys(columnsData).forEach(columnId => {
        const column = document.getElementById(columnId);
        const taskList = column.querySelector('.task-list');
        taskList.innerHTML = ''; // Clear existing tasks

        columnsData[columnId].forEach(taskText => {
            const task = document.createElement('div');
            task.classList.add('task-card');
            task.setAttribute('draggable', 'true');
            task.textContent = taskText;
            taskList.appendChild(task);
        });
    });

    enableDragAndDrop(); // Re-enable drag and drop for loaded tasks
}

// Initialize all functionality
function initializeTaskly() {
    loadSessionData(); // Load session data when the page is loaded
    enableDragAndDrop();
    enableTaskInput();
    enableTrashBin();
}

document.addEventListener('DOMContentLoaded', initializeTaskly);
