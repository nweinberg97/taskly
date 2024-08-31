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

            // Handle in-progress and other columns
            if (column.parentElement.id === 'in-progress') {
                draggingTask.classList.add('in-progress');
                if (!draggingTask.querySelector('.start-button')) {
                    addStartButton(draggingTask); // Add the start button only if it doesn't exist
                }
            } else {
                draggingTask.classList.remove('in-progress');
                const startButton = draggingTask.querySelector('.start-button');
                if (startButton) {
                    startButton.remove(); // Remove the start button when moved out of the in-progress column
                }
            }

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

    // Add the Start button if in the in-progress column
    if (column.id === 'in-progress') {
        newTask.classList.add('in-progress'); // Add the in-progress class
        addStartButton(newTask);
    }

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
        // Prevent the double click from affecting the start button
        if (e.target.classList.contains('start-button')) {
            return;
        }

        const currentText = taskCard.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('task-edit-input');

        taskCard.textContent = '';
        taskCard.appendChild(input);
        input.focus();

        // Save the edited task when Enter is pressed or input loses focus
        const saveTask = () => {
            taskCard.textContent = input.value.trim();
            saveSessionData(); // Save the session data after editing

            // Re-add the Start button if the task is in the in-progress column
            if (taskCard.classList.contains('in-progress')) {
                addStartButton(taskCard);
            }
        };

        input.addEventListener('blur', saveTask);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveTask();
            }
        });
    });
}

// Function to add the Start button to in-progress tasks
function addStartButton(taskCard) {
    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.classList.add('start-button');

    startButton.addEventListener('click', () => {
        startPomodoroTimer(taskCard);
    });

    taskCard.appendChild(startButton);
}

// Function to handle the Pomodoro timer
function startPomodoroTimer(taskCard) {
    // Create the Pomodoro timer overlay
    const timerOverlay = document.createElement('div');
    timerOverlay.id = 'pomodoro-overlay';

    // Create the timer display
    const timerDisplay = document.createElement('div');
    timerDisplay.id = 'pomodoro-timer';
    timerDisplay.innerHTML = `
        <div id="time-display">20:00</div>
        <div id="timer-controls">
            <button id="start-timer">Start</button>
            <button id="pause-timer">Pause</button>
            <button id="reset-timer">Reset</button>
        </div>
        <div class="timer-modes">
            <button data-time="15">15 min</button>
            <button data-time="20" class="active">20 min</button>
            <button data-time="25">25 min</button>
            <button data-time="30">30 min</button>
        </div>
    `;

    timerOverlay.appendChild(timerDisplay);
    document.body.appendChild(timerOverlay);

    // Add timer functionality here...

    // Event listener to remove the overlay when reset
    const resetControl = document.getElementById('reset-timer');
    resetControl.addEventListener('click', () => {
        document.body.removeChild(timerOverlay);
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

            // Add the Start button if in the in-progress column
            if (columnId === 'in-progress') {
                task.classList.add('in-progress'); // Add the in-progress class
                addStartButton(task);
            }
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
