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
            const columns = document.querySelectorAll('.column');
            columns.forEach(column => column.classList.remove('hovering')); // Ensure hovering class is removed on dragend
            saveSessionData(); // Save the session data when dragging ends
        });
    });

    // Adding event listeners to columns for drag over and drop
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.parentElement.classList.add('hovering'); // Add hovering class to the parent column
            const draggingTask = document.querySelector('.dragging');
            const afterElement = getDragAfterElement(column, e.clientY);
            if (afterElement == null) {
                column.appendChild(draggingTask); // If no element found, append to the column
            } else {
                column.insertBefore(draggingTask, afterElement); // Insert before the identified element
            }
        });

        column.addEventListener('dragenter', (e) => {
            e.preventDefault();
            column.parentElement.classList.add('hovering'); // Add hovering class to the parent column
        });

        column.addEventListener('dragleave', () => {
            column.parentElement.classList.remove('hovering'); // Remove hovering class when leaving
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            const afterElement = getDragAfterElement(column, e.clientY);
            if (afterElement == null) {
                column.appendChild(draggingTask); // If no element found, append to the column
            } else {
                column.insertBefore(draggingTask, afterElement); // Insert in the correct position
            }
            column.parentElement.classList.remove('hovering'); // Remove hovering class on drop

            saveSessionData(); // Save the session data after dropping
        });
    });
}

// Function to determine the correct position to insert a dragged task
function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.task-card:not(.dragging)')];

    // If no draggable elements exist (column is empty), return null to append the card
    if (draggableElements.length === 0) {
        return null;
    }

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

    // Make the new task editable
    makeTaskEditable(newTask);

    // Clear the input field
    taskInput.value = '';

    // Re-enable drag and drop for the new task
    enableDragAndDrop();

    // Save session data
    saveSessionData();
}

// Function to make a task card editable
function makeTaskEditable(taskCard) {
    taskCard.addEventListener('dblclick', (e) => {
        const currentText = [...taskCard.childNodes].find(node => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || '';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('task-edit-input');

        // Remove only the text node, keep other elements intact
        [...taskCard.childNodes].forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                taskCard.removeChild(node); // Remove text node only
            }
        });

        taskCard.insertBefore(input, taskCard.firstChild); // Insert input at the beginning
        input.focus();

        // Save the edited task when Enter is pressed or input loses focus
        const saveTask = () => {
            const newText = input.value.trim();
            input.remove(); // Remove the input field

            if (newText !== '') {
                taskCard.insertBefore(document.createTextNode(newText), taskCard.firstChild);
            } else {
                taskCard.insertBefore(document.createTextNode(currentText), taskCard.firstChild);
            }

            saveSessionData(); // Save the session data after editing
        };

        // Event listeners for blur or pressing Enter to save the task
        input.addEventListener('blur', saveTask);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveTask();
            }
        });
    });
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

            // Make the loaded task editable
            makeTaskEditable(task);
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
