document.addEventListener("DOMContentLoaded", () => {
    let draggedCard = null;

    function createTaskCard(taskText, columnId) {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        taskCard.textContent = taskText;
        taskCard.setAttribute("draggable", "true");

        // Event listeners for drag and drop
        taskCard.addEventListener('dragstart', (e) => {
            draggedCard = taskCard;
            e.dataTransfer.effectAllowed = 'move';
        });

        taskCard.addEventListener('dragend', () => {
            draggedCard = null;
        });

        const taskList = document.getElementById(columnId).querySelector('.task-list');
        taskList.appendChild(taskCard);
    }

    document.querySelectorAll('.column').forEach(column => {
        const input = column.querySelector('.task-input');
        const button = column.querySelector('.add-task-button');
        const taskList = column.querySelector('.task-list');

        button.addEventListener('click', () => {
            const taskText = input.value.trim();
            if (taskText) {
                createTaskCard(taskText, column.id);
                input.value = ''; // Clear the input field after adding
                saveToLocalStorage(); // Save state after adding a task
            }
        });

        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedCard) {
                taskList.appendChild(draggedCard);
                saveToLocalStorage(); // Save state after moving a task
            }
        });
    });

    // Trash bin functionality
    const trashBin = document.getElementById('trash-bin');
    trashBin.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    trashBin.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedCard) {
            draggedCard.remove();
            saveToLocalStorage(); // Save state after deleting a task
        }
    });

    // Load tasks from local storage on page load
    loadFromLocalStorage();

    function saveToLocalStorage() {
        const data = {};
        document.querySelectorAll('.column').forEach(column => {
            const columnId = column.id;
            const tasks = [];
            column.querySelectorAll('.task-card').forEach(taskCard => {
                tasks.push(taskCard.textContent);
            });
            data[columnId] = tasks;
        });
        localStorage.setItem('taskData', JSON.stringify(data));
    }

    function loadFromLocalStorage() {
        const data = JSON.parse(localStorage.getItem('taskData'));
        if (!data) return;

        for (const [columnId, tasks] of Object.entries(data)) {
            const taskList = document.getElementById(columnId).querySelector('.task-list');
            tasks.forEach(taskText => {
                createTaskCard(taskText, columnId);
            });
        }
    }
});
