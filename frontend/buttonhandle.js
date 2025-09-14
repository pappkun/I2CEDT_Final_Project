// Select DOM elements
const addButton = document.querySelector('.add-button');
const addArea = document.querySelector('.addarea');

// Create a container for the list if it doesn't exist yet
let listContainer = document.createElement('ul');
addArea.parentNode.insertBefore(listContainer, addArea.nextSibling);

// Add button click handler
addButton.addEventListener('click', () => {
    const text = addArea.value.trim();
    if (!text) return; // Do nothing if textarea is empty

    // Create list item
    const li = document.createElement('li');
    li.className = 'job-item';
    li.style.marginBottom = '8px';

    // Create span for text
    const span = document.createElement('span');
    span.textContent = text;

    // Create delete button using class
    const delButton = document.createElement('button');
    delButton.textContent = 'Delete';
    delButton.className = 'delete-button'; // use your existing class

    delButton.addEventListener('click', () => {
        li.remove();
    });

    li.appendChild(span);
    li.appendChild(delButton);
    listContainer.appendChild(li);

    // Clear textarea after adding
    addArea.value = '';
});
