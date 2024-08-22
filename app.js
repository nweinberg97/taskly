// Function to initialize drag and drop functionality
function enableDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.task-list');

    // Adding event listeners to task cards for dragging
    taskCards.forEach(task => {
        // Event listener for when the user starts dragging a task
        task.addEventListener('dragstart', () => {
            task.classList.add('dragging'); // Add a class to the task indicating it's being dragged
        });

        // Event listener for when the user stops dragging a task
        task.addEventListener('dragend', () => {
            task.classList.remove('dragging'); // Remove the class when dragging ends
            saveSessionData(); // Save the session data when dragging ends
        });
    });

    // Adding event listeners to columns for drag over and drop
    columns.forEach(column => {
        // Event listener for when a dragged task is over a column
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); // Prevent the default behavior to allow dropping
            const draggingTask = document.querySelector('.dragging'); // Get the currently dragged task
            const afterElement = getDragAfterElement(column, e.clientY); // Determine where to place the dragged task
            if (afterElement == null) {
                column.appendChild(draggingTask); // If there's no task below, append to the end
            } else {
                column.insertBefore(draggingTask, afterElement); // Otherwise, insert before the next task
            }
        });

        // Event listener for when the dragged task enters a column
        column.addEventListener('dragenter', (e) => {
            e.preventDefault(); // Allow the dragenter event to be handled
            column.classList.add('hovering'); // Add a visual indication that the column is a valid drop zone
        });

        // Event listener for when the dragged task leaves a column
        column.addEventListener('dragleave', () => {
            column.classList.remove('hovering'); // Remove the visual indication
        });

        // Event listener for when the dragged task is dropped in a column
        column.addEventListener('drop', (e) => {
            e.preventDefault(); // Prevent default to handle the drop
            const draggingTask = document.querySelector('.dragging'); // Get the dragged task
            const afterElement = getDragAfterElement(column, e.clientY); // Determine where to place the dragged task
            if (afterElement == null) {
                column.appendChild(draggingTask); // Append to the end if there's no other task
            } else {
                column.insertBefore(draggingTask, afterElement); // Insert before the next task
            }
            column.classList.remove('hovering'); // Remove the hovering class after drop
            saveSessionData(); // Save the session data after dropping
        });
    });
}

// Function to determine the correct position to insert a dragged task
function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.task-card:not(.dragging)')]; // Get all draggable tasks except the one being dragged

    // Reduce the list of elements to find the closest one to the current cursor position
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect(); // Get the bounding box of the element
        const offset = y - box.top - box.height / 2; // Calculate the distance between the cursor and the element's center
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }; // If the cursor is above the element, return it as closest
        } else {
            return closest; // Otherwise, keep the current closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element; // Start with an infinitely negative offset
}

// Function to add a new task to a column
function addTaskToColumn(column) {
    const taskInput = column.querySelector('.task-input'); // Get the input field for the task
    const taskList = column.querySelector('.task-list'); // Get the list of tasks in the column

    const taskText = taskInput.value.trim(); // Get the task text and remove extra whitespace
    if (taskText === '') return; // If the input is empty, do nothing

    const newTask = document.createElement('div'); // Create a new div for the task card
    newTask.classList.add('task-card'); // Add the appropriate class
    newTask.setAttribute('draggable', 'true'); // Make the task card draggable
    newTask.textContent = taskText; // Set the task text

    // Add the new task to the task list
    taskList.appendChild(newTask);

    // Clear the input field
    taskInput.value = '';

    // Re-enable drag and drop for the new task
    enableDragAndDrop();

    // Save session data
    saveSessionData();
}

// Function to handle adding a task when the enter key is pressed
function enableTaskInput() {
    const columns = document.querySelectorAll('.column'); // Get all columns

    columns.forEach(column => {
        const addButton = column.querySelector('.add-task-button'); // Get the add task button
        const taskInput = column.querySelector('.task-input'); // Get the task input field

        // Event listener for when the add task button is clicked
        addButton.addEventListener('click', () => addTaskToColumn(column));

        // Event listener for when the enter key is pressed
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                addTaskToColumn(column);
            }
        });
    });
}

// Function to handle trash bin functionality
function enableTrashBin() {
    const trashBin = document.querySelector('.trash-bin'); // Get the trash bin element
    const sound = new Audio('sounds/plastic-crunch-83779.mp3'); // Load the sound file for trash bin

    // Event listener for when a dragged task is over the trash bin
    trashBin.addEventListener('dragover', (e) => {
        e.preventDefault(); // Prevent default to allow dropping
    });

    // Event listener for when a task is dropped into the trash bin
    trashBin.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingTask = document.querySelector('.dragging'); // Get the currently dragged task
        if (draggingTask) {
            draggingTask.remove(); // Remove the task from the DOM
            sound.play(); // Play the trash bin sound effect
            saveSessionData(); // Save session data after deletion
        }
    });
}

// Function to save session data to localStorage
function saveSessionData() {
    const columnsData = {}; // Initialize an object to store columns data
    const columns = document.querySelectorAll('.column'); // Get all columns
    
    columns.forEach(column => {
        const columnId = column.id; // Get the column's ID
        const tasks = [...column.querySelectorAll('.task-card')].map(task => task.textContent); // Get all task texts in the column
        columnsData[columnId] = tasks; // Store the tasks under the column's ID
    });

    localStorage.setItem('tasklyData', JSON.stringify(columnsData)); // Save the data to localStorage
}

// Function to load session data from localStorage
function loadSessionData() {
    const columnsData = JSON.parse(localStorage.getItem('tasklyData')); // Parse the stored JSON data

    if (!columnsData) return; // If there's no data, return

    Object.keys(columnsData).forEach(columnId => {
        const column = document.getElementById(columnId); // Get the column by ID
        const taskList = column.querySelector('.task-list'); // Get the task list in the column
        taskList.innerHTML = ''; // Clear existing tasks

        columnsData[columnId].forEach(taskText => {
            const task = document.createElement('div'); // Create a new task card
            task.classList.add('task-card'); // Add the appropriate class
            task.setAttribute('draggable', 'true'); // Make the task card draggable
            task.textContent = taskText; // Set the task text
            taskList.appendChild(task); // Add the task to the list
        });
    });

    enableDragAndDrop(); // Re-enable drag and drop for loaded tasks
}

// Initialize all functionality
function initializeTaskly() {
    loadSessionData(); // Load session data when the page is loaded
    enableDragAndDrop(); // Initialize drag and drop functionality
    enableTaskInput(); // Enable task input functionality
    enableTrashBin(); // Enable trash bin functionality
}

// Initialize everything once the DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeTaskly);
