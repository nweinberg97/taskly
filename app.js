document.addEventListener("DOMContentLoaded", () => {
    let draggedCard = null;

    function createTaskCard(taskText, columnId) {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        taskCard.textContent = taskText;
        taskCard.setAttribute("draggable", "true");
        
        // Add drag event listeners
        taskCard.addEventListener('dragstart', (e) => {
            draggedCard = taskCard;
            e.dataTransfer.effectAllowed = 'move';
        });

        taskCard.addEventListener('dragend', () => {
            draggedCard = null;
        });

        document.getElementById(columnId).querySelector('.task-list').appendChild(taskCard);
    }

    // Setup input fields and buttons for task creation
    document.querySelectorAll('.column').forEach(column => {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Add a task...';
        const button = document.createElement('button');
        button.textContent = 'Add Task';
        
        button.addEventListener('click', () => {
            if (input.value.trim()) {
                createTaskCard(input.value.trim(), column.id);
                input.value = ''; // Clear the input field
            }
        });
        
        column.prepend(input);
        column.prepend(button);
    });

    // Handle drag over and drop for columns
    document.querySelectorAll('.task-list').forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow a drop
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedCard) {
                list.appendChild(draggedCard);
            }
        });
    });

    // Handle task deletion via trash bin
    const trashBin = document.getElementById('trash-bin');
    trashBin.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    trashBin.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedCard) {
            draggedCard.remove();
            draggedCard = null;
        }
    });
});
