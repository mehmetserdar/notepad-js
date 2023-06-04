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
        var confirmed = confirm('Are you sure you want to delete note?');
        if (confirmed) {
        li.parentNode.removeChild(li);
        localStorage.removeItem(noteKeyPrefix + noteId);
        alert('Note deleted!');
        }
    });

    document.getElementById('export-button').addEventListener('click', function() {
        exportNotesToCSV();
    });

    

    var editDeleteContainer = document.createElement('div');
    editDeleteContainer.className = 'float-right';
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
        var titleElement = document.getElementsByClassName('app-title');
        if (titleElement) {
            titleElement.style.display = 'none';
        }
    }
});


function exportNotesToCSV() {
    var csvContent = 'data:text/csv;charset=utf-8,';

    // Add the CSV headers
    var headers = ['ID', 'Note Content', 'Date'];
    csvContent += headers.join(',') + '\n';

    // Iterate through the notes and add them to the CSV content
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith(noteKeyPrefix)) {
            var noteId = key.substring(noteKeyPrefix.length);
            var noteContent = localStorage.getItem(key);
            var noteDate = getFormattedDate();
            var rowData = [noteId, noteContent, noteDate];
            csvContent += rowData.join(',') + '\n';
        }
    }

    // Create a data URI for the CSV content
    var encodedURI = encodeURI(csvContent);

    // Create a link element and set its attributes for downloading
    var link = document.createElement('a');
    link.setAttribute('href', encodedURI);
    link.setAttribute('download', 'notes.csv');

    // Append the link to the document and trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getRandomQuote() {
    fetch('https://type.fit/api/quotes')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var randomIndex = Math.floor(Math.random() * data.length);
            var quote = data[randomIndex].text;
            var author = data[randomIndex].author || 'Unknown';

            var noteContentTextArea = document.getElementById('note-content');
            noteContentTextArea.value = '"' + quote + '" - ' + author;
        })
        .catch(function(error) {
            console.log('An error occurred while fetching the random quote:', error);
        });
}

document.getElementById('random-quote-button').addEventListener('click', function() {
    getRandomQuote();
});


function getRandomJoke() {
    fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=religious,racist')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var joke = data.joke || data.setup + ' ' + data.delivery;
            var category = data.category || 'Unknown';

            var noteContentTextArea = document.getElementById('note-content');
            noteContentTextArea.value = joke + '\n\nCategory: ' + category;
        })
        .catch(function(error) {
            console.log('An error occurred while fetching the random joke:', error);
        });
}

document.getElementById('random-joke-button').addEventListener('click', function() {
    getRandomJoke();
});


function getRandomAffirmation() {
    fetch('https://raw.githubusercontent.com/mehmetserdar/affirmations-api/main/affir.json')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var affirmations = data.affirmations;
            var randomIndex = Math.floor(Math.random() * affirmations.length);
            var affirmation = affirmations[randomIndex];

            var noteContentTextArea = document.getElementById('note-content');
            noteContentTextArea.value = affirmation;
        })
        .catch(function(error) {
            console.log('An error occurred while fetching the random affirmation:', error);
        });
}

document.getElementById('random-affirmation-button').addEventListener('click', function() {
    getRandomAffirmation();
});


