var noteKeyPrefix = 'note_';

function createNoteItem(noteId, noteContent) {
    var li = document.createElement('li');
    li.className = 'list-group-item';
    li.id = noteId; // Assign the unique ID to the note item

    var noteDate = document.createElement('span');
    noteDate.className = 'note-date mr-2';
    noteDate.innerHTML = getFormattedDate();

    var noteContentElement = document.createElement('span');
    noteContentElement.className = 'note-content';
    noteContentElement.innerHTML = noteContent;
    li.appendChild(noteContentElement);

    var editButton = document.createElement('button');
    editButton.className = 'btn btn-secondary btn-sm mr-2';
    editButton.innerHTML = 'Edit 📝';
    editButton.addEventListener('click', function() {
        document.getElementById('note-content').value = noteContent;
        document.getElementById('note-content').setAttribute('data-note-id', noteId);
    });

    var deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.innerHTML = 'Delete 🗑️';
    deleteButton.addEventListener('click', function() {
        li.parentNode.removeChild(li);
        localStorage.removeItem(noteKeyPrefix + noteId);
        alert('Note deleted!');
    });

    var editDeleteContainer = document.createElement('div');
    editDeleteContainer.className = 'float-right';
    editDeleteContainer.appendChild(noteDate);
    editDeleteContainer.appendChild(editButton);
    editDeleteContainer.appendChild(deleteButton);

    li.appendChild(editDeleteContainer);

    return li;
}

document.getElementById('save-button').addEventListener('click', function() {
    var noteContent = document.getElementById('note-content').value;
    if (noteContent.trim() !== '') {
        var noteId = document.getElementById('note-content').getAttribute('data-note-id');
        if (noteId) {
            // Update existing note
            var noteItem = document.getElementById(noteId);
            noteItem.querySelector('.note-content').innerHTML = noteContent;
            localStorage.setItem(noteKeyPrefix + noteId, noteContent);
            alert('Note updated successfully!');
        } else {
            // Create new note
            noteId = Date.now(); // Generate a unique ID for the note
            var noteItem = createNoteItem(noteId, noteContent);
            document.getElementById('note-list').appendChild(noteItem);
            localStorage.setItem(noteKeyPrefix + noteId, noteContent);
            alert('Note saved successfully!');
        }
        document.getElementById('note-content').value = '';
        document.getElementById('note-content').removeAttribute('data-note-id');
    } else {
        alert('Note content cannot be empty!');
    }
});

window.addEventListener('DOMContentLoaded', function() {
    // Load all saved notes from local storage
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith(noteKeyPrefix)) {
            var noteId = key.substring(noteKeyPrefix.length);
            var noteContent = localStorage.getItem(key);
            var noteItem = createNoteItem(noteId, noteContent);
            document.getElementById('note-list').appendChild(noteItem);
        }
    }
});

function getFormattedDate() {
    var date = new Date();
    var options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

document.getElementById('clear-button').addEventListener('click', function() {
    var confirmed = confirm('Are you sure you want to clear all notes?');
    if (confirmed) {
        clearAllNotes();
        alert('All notes cleared!');
    }
});

function clearAllNotes() {
    // Clear all notes from local storage
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith(noteKeyPrefix)) {
            localStorage.removeItem(key);
        }
    }

    // Clear all note items from the list
    var noteList = document.getElementById('note-list');
    while (noteList.firstChild) {
        noteList.removeChild(noteList.firstChild);
    }
}

window.addEventListener('DOMContentLoaded', function() {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) {
        var titleElement = document.getElementById('app-title');
        if (titleElement) {
            titleElement.style.display = 'none';
        }
    }
});
