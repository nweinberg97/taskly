document.addEventListener("DOMContentLoaded", () => {
    let draggedCard = null;

    function createTaskCard(taskText, columnId) {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card"; // Ensure the correct class name
        taskCard.textContent = taskText;
        taskCard.setAttribute("draggable", "true");

        // Drag and drop event listeners
        taskCard.addEventListener('dragstart', (e) => {
            draggedCard = taskCard;
            e.dataTransfer.effectAllowed = 'move';
        });

        taskCard.addEventListener('dragend', () => {
            draggedCard = null;
        });

        document.getElementById(columnId).querySelector('.task-list').appendChild(taskCard);
    }

    // Event listener for creating new tasks
    document.querySelectorAll('.column').forEach(column => {
        const input = column.querySelector('input[type="text"]');
        const button = column.querySelector('button');

        button.addEventListener('click', () => {
            const taskText = input.value.trim();
            if (taskText) {
                createTaskCard(taskText, column.id);
                input.value = ''; // Clear the input field after adding
            }
        });
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
