// Select all necessary elements
const addTaskButtons = document.querySelectorAll('.add-task-button');
const taskInputFields = document.querySelectorAll('.task-input');
const columns = document.querySelectorAll('.task-list');
const trashBin = document.getElementById('trash-bin');

// Load the sound file
const trashSound = new Audio('sounds/plastic-crunch-83779.mp3');

// Load tasks from local storage
window.onload = () => {
    loadTasks();
}

// Function to create a new task card
function createTaskCard(taskText) {
    const taskCard = document.createElement('div');
    taskCard.classList.add('task-card');
    taskCard.textContent = taskText;
    taskCard.draggable = true;

    // Add drag events
    taskCard.addEventListener('dragstart', dragStart);
    taskCard.addEventListener('dragend', dragEnd);

    return taskCard;
}

// Function to handle adding tasks
function addTask(event) {
    const inputField = event.target.nextElementSibling || event.target;
    const taskText = inputField.value.trim();

    if (taskText !== '') {
        const taskList = inputField.parentElement.nextElementSibling;
        const taskCard = createTaskCard(taskText);
        taskList.appendChild(taskCard);
        inputField.value = ''; // Clear the input field
        saveTasks(); // Save the updated tasks
    }
}

// Event listeners for adding tasks via button click
addTaskButtons.forEach(button => {
    button.addEventListener('click', addTask);
});

// Event listeners for adding tasks via Enter key
taskInputFields.forEach(inputField => {
    inputField.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            addTask(event);
        }
    });
});

// Drag and drop functionality
let draggedTask = null;

function dragStart(event) {
    draggedTask = event.target;
    setTimeout(() => event.target.style.display = 'none', 0);
}

function dragEnd(event) {
    setTimeout(() => {
        event.target.style.display = 'block';
        draggedTask = null;
        saveTasks(); // Save the updated tasks after reordering
    }, 0);
}

// Dragover event for columns
columns.forEach(column => {
    column.addEventListener('dragover', event => {
        event.preventDefault();
        const afterElement = getDragAfterElement(column, event.clientY);
        if (afterElement == null) {
            column.appendChild(draggedTask); // Append to the column if empty
        } else {
            column.insertBefore(draggedTask, afterElement);
        }
    });
});

// Function to get the element after which the dragged element should be placed
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

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

// Dragover event for trash bin
trashBin.addEventListener('dragover', event => {
    event.preventDefault();
});

// Drop event for trash bin to delete tasks and play sound
trashBin.addEventListener('drop', () => {
    if (draggedTask) {
        draggedTask.remove();
        trashSound.play(); // Play the trash sound effect
        saveTasks(); // Save the updated tasks after deletion
    }
});

// Function to save tasks to local storage
function saveTasks() {
    const tasks = {};

    columns.forEach((column, index) => {
        const taskCards = column.querySelectorAll('.task-card');
        tasks[`column-${index}`] = [];

        taskCards.forEach(taskCard => {
            tasks[`column-${index}`].push(taskCard.textContent);
        });
    });

    localStorage.setItem('taskly-tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('taskly-tasks'));

    if (savedTasks) {
        Object.keys(savedTasks).forEach((key, index) => {
            const columnTasks = savedTasks[key];
            const column = columns[index];

            columnTasks.forEach(taskText => {
                const taskCard = createTaskCard(taskText);
                column.appendChild(taskCard);
            });
        });
    }
}

