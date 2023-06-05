var noteKeyPrefix = "note_";

function createNoteItem(noteId, noteContent) {
  var li = document.createElement("li");
  li.className = "list-group-item";
  li.id = noteId; // Assign the unique ID to the note item

  var noteDate = document.createElement("span");
  noteDate.className = "note-date mr-2";
  noteDate.innerHTML = getFormattedDate();

  var noteContentElement = document.createElement("span");
  noteContentElement.className = "note-content";
  noteContentElement.innerHTML = noteContent;
  li.appendChild(noteContentElement);

  var editButton = document.createElement("button");
  editButton.className = "btn btn-secondary btn-sm mr-2";
  editButton.innerHTML = "Edit 📝";
  editButton.addEventListener("click", function () {
    document.getElementById("note-content").value = noteContent;
    document
      .getElementById("note-content")
      .setAttribute("data-note-id", noteId);
  });

  var deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-danger btn-sm";
  deleteButton.innerHTML = "Delete 🗑️";
  deleteButton.addEventListener("click", function () {
    var confirmed = confirm("Are you sure you want to delete note?");
    if (confirmed) {
      li.parentNode.removeChild(li);
      localStorage.removeItem(noteKeyPrefix + noteId);
      alert("Note deleted!");
    }
  });

  var editDeleteContainer = document.createElement("div");
  editDeleteContainer.className = "float-right";
  editDeleteContainer.appendChild(editButton);
  editDeleteContainer.appendChild(deleteButton);

  li.appendChild(editDeleteContainer);

  return li;
}

document.getElementById("save-button").addEventListener("click", function () {
  var noteContent = document.getElementById("note-content").value;
  if (noteContent.trim() !== "") {
    var noteId = document
      .getElementById("note-content")
      .getAttribute("data-note-id");
    if (noteId) {
      // Update existing note
      var noteItem = document.getElementById(noteId);
      noteItem.querySelector(".note-content").innerHTML = noteContent;
      localStorage.setItem(noteKeyPrefix + noteId, noteContent);
      alert("Note updated successfully!");
    } else {
      // Create new note
      noteId = Date.now(); // Generate a unique ID for the note
      var noteItem = createNoteItem(noteId, noteContent);
      document.getElementById("note-list").appendChild(noteItem);
      localStorage.setItem(noteKeyPrefix + noteId, noteContent);
      alert("Note saved successfully!");
    }
    document.getElementById("note-content").value = "";
    document.getElementById("note-content").removeAttribute("data-note-id");
  } else {
    alert("Note content cannot be empty!");
  }
});

window.addEventListener("DOMContentLoaded", function () {
  // Load all saved notes from local storage
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith(noteKeyPrefix)) {
      var noteId = key.substring(noteKeyPrefix.length);
      var noteContent = localStorage.getItem(key);
      var noteItem = createNoteItem(noteId, noteContent);
      document.getElementById("note-list").appendChild(noteItem);
    }
  }
});

function getFormattedDate() {
  var date = new Date();
  var options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

document.getElementById("clear-button").addEventListener("click", function () {
  var confirmed = confirm("Are you sure you want to clear all notes?");
  if (confirmed) {
    clearAllNotes();
    alert("All notes cleared!");
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
  var noteList = document.getElementById("note-list");
  while (noteList.firstChild) {
    noteList.removeChild(noteList.firstChild);
  }
}

window.addEventListener("DOMContentLoaded", function () {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("android")) {
    var titleElement = document.getElementsByClassName("app-title");
    if (titleElement) {
      titleElement.style.display = "none";
    }
  }
});

document.getElementById("export-button").addEventListener("click", function () {
  exportNotesToCSV();
});

function exportNotesToCSV() {
  var notes = [];

  // Iterate through the notes and add them to the notes array
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith(noteKeyPrefix)) {
      var noteId = key.substring(noteKeyPrefix.length);
      var noteContent = localStorage.getItem(key);
      var rowData = [noteId, noteContent];
      notes.push(rowData);
    }
  }

  // Create the CSV content
  var csvContent = "data:text/csv;charset=utf-8,";

  // Add the CSV headers
  csvContent += "ID,Note Content\n";

  // Add the note rows to the CSV content
  notes.forEach(function (note) {
    var row = note.map(function (value) {
      return value.replace(/,/g, ""); // Remove commas
    });
    csvContent += row.join(",") + "\n";
  });

  // Create a data URI for the CSV content
  var encodedURI = encodeURI(csvContent);

  // Create a link element and set its attributes for downloading
  var link = document.createElement("a");
  link.setAttribute("href", encodedURI);
  link.setAttribute("download", "notes.csv");
  link.style.display = "none";

  // Append the link to the document body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Clean up the link element
  document.body.removeChild(link);
}
// function getInfoAboutToday() {
//     var currentDate = new Date();
//     var today = currentDate.getMonth() + 1 + '/' + currentDate.getDate();

//     fetch('http://numbersapi.com/' + today + '/date')
//         .then(function(response) {
//             return response.text();
//         })
//         .then(function(data) {
//             var info = data || 'Unknown';

//             var noteContentTextArea = document.getElementById('note-content');
//             noteContentTextArea.value = info;
//         })
//         .catch(function(error) {
//             console.log('An error occurred while fetching information about today:', error);
//         });
// }

// document.getElementById('today-info-button').addEventListener('click', function() {
//     getInfoAboutToday();
// });



function getRandomRecipe() {
    fetch('https://www.themealdb.com/api/json/v1/1/random.php')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var recipe = data.meals[0];
            var recipeName = recipe.strMeal || 'Unknown';
            var recipeCategory = recipe.strCategory || 'Unknown';
            var recipeArea = recipe.strArea || 'Unknown';
            var recipeInstructions = recipe.strInstructions || 'Unknown';

            var ingredients = [];
            // Collect up to 20 ingredients
            for (let i = 1; i <= 20; i++) {
                var ingredient = recipe['strIngredient' + i];
                var measure = recipe['strMeasure' + i];
                if (ingredient && measure) {
                    ingredients.push(measure + ' ' + ingredient);
                }
            }

            var recipeInfo = 'Recipe: ' + recipeName + '\n' +
                             'Category: ' + recipeCategory + '\n' +
                             'Area: ' + recipeArea + '\n\n' +
                             'Ingredients:\n' + ingredients.join('\n') + '\n\n' +
                             'Instructions:\n' + recipeInstructions;

            var noteContentTextArea = document.getElementById('note-content');
            noteContentTextArea.value = recipeInfo;
        })
        .catch(function(error) {
            console.log('An error occurred while fetching the random recipe:', error);
        });
}

document.getElementById('random-recipe-button').addEventListener('click', function() {
    getRandomRecipe();
});



function getRandomCountryInfo() {
    fetch('https://restcountries.com/v3.1/all')
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var randomIndex = Math.floor(Math.random() * data.length);
            var country = data[randomIndex];

            var countryName = country.name.common || 'Unknown';
            var countryCapital = country.capital || 'Unknown';
            var countryPopulation = country.population || 'Unknown';
            var countryRegion = country.region || 'Unknown';

            var countryInfo = 'Country: ' + countryName + '\n' +
                              'Capital: ' + countryCapital + '\n' +
                              'Population: ' + countryPopulation + '\n' +
                              'Region: ' + countryRegion;

            var noteContentTextArea = document.getElementById('note-content');
            noteContentTextArea.value = countryInfo;
        })
        .catch(function(error) {
            console.log('An error occurred while fetching random country information:', error);
        });
}

document.getElementById('random-country-button').addEventListener('click', function() {
    getRandomCountryInfo();
});


function getRandomActivity() {
  fetch("https://www.boredapi.com/api/activity/")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var activity = data.activity || "Unknown";

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = activity;
    })
    .catch(function (error) {
      console.log(
        "An error occurred while fetching the random activity:",
        error
      );
    });
}

document
  .getElementById("random-activity-button")
  .addEventListener("click", function () {
    getRandomActivity();
  });

function getRandomQuote() {
  fetch("https://type.fit/api/quotes")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var randomIndex = Math.floor(Math.random() * data.length);
      var quote = data[randomIndex].text;
      var author = data[randomIndex].author || "Unknown";

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = '"' + quote + '" - ' + author;
    })
    .catch(function (error) {
      console.log("An error occurred while fetching the random quote:", error);
    });
}


document
  .getElementById("random-quote-button")
  .addEventListener("click", function () {
    getRandomQuote();
  });

function getRandomJoke() {
  fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=religious,racist,sexist,explicit,nsfw")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var joke = data.joke || data.setup + " " + data.delivery;
      var category = data.category || "Unknown";

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = joke + "\n\nCategory: " + category;
    })
    .catch(function (error) {
      console.log("An error occurred while fetching the random joke:", error);
    });
}

document
  .getElementById("random-joke-button")
  .addEventListener("click", function () {
    getRandomJoke();
  });

function getRandomAffirmation() {
  fetch(
    "https://raw.githubusercontent.com/mehmetserdar/affirmations-api/main/affir.json"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var affirmations = data.affirmations;
      var randomIndex = Math.floor(Math.random() * affirmations.length);
      var affirmation = affirmations[randomIndex];

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = affirmation;
    })
    .catch(function (error) {
      console.log(
        "An error occurred while fetching the random affirmation:",
        error
      );
    });
}

document
  .getElementById("random-affirmation-button")
  .addEventListener("click", function () {
    getRandomAffirmation();
  });
