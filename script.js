var noteKeyPrefix = "note_";
var colorButtons = document.getElementsByClassName("color-button");
var feelingButton = document.getElementById("feeling-button");
var feelingModal = document.getElementById("feeling-modal");
var feelingChoices = document.getElementsByClassName("feeling-choice");
var importButton = document.getElementById("import-button");
var exportButton = document.getElementById("export-button");
var importFile = document.getElementById("import-file");

function handleColorButtonClick(event) {
  var color = event.target.getAttribute("data-color");
  updateNoteColor(color);
}

// Generate a unique note ID
function generateNoteId() {
  return "note_" + Date.now();
}

// Function to convert RGB color to hex color
function rgbToHex(rgb) {
  try {
    // Remove whitespace and extract the RGB values
    var rgbValues = rgb.replace(/\s/g, "").match(/^rgb\((\d+),(\d+),(\d+)\)$/);

    // Check if RGB values are valid
    if (rgbValues && rgbValues.length === 4) {
      var r = parseInt(rgbValues[1]);
      var g = parseInt(rgbValues[2]);
      var b = parseInt(rgbValues[3]);

      // Convert each RGB component to hex
      var hex = "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

      return hex;
    } else {
      // Return default hex color (#ffffff) if RGB format is invalid or empty
      return "#ffffff";
    }
  } catch (error) {
    console.error("Error converting RGB to hex:", error);
    return "#ffffff";
  }
}

// Attach event listener to feeling button
feelingButton.addEventListener("click", function () {
  $("#feeling-modal").modal("show");
});

// Attach event listeners to feeling choices
for (var i = 0; i < feelingChoices.length; i++) {
  feelingChoices[i].addEventListener("click", function () {
    var feelingChoice = this.innerText;
    var today = new Date().toLocaleDateString();
    document.getElementById("note-content").value =
      "I'm " + feelingChoice.toLowerCase() + " (" + today + ")";
    $("#feeling-modal").modal("hide");
  });
}

function createNoteItem(noteId, noteContent, noteColor) {
  var li = document.createElement("li");
  li.className = "list-group-item";
  li.id = noteId; // Assign the unique ID to the note item
  li.style.backgroundColor = noteColor; // Set the note item background color
  noteColor = rgbToHex(noteColor);

  var noteContentElement = document.createElement("span");
  noteContentElement.className = "note-content";
  noteContentElement.innerHTML = noteContent;
  li.appendChild(noteContentElement);

  var setButton = document.createElement("button");
  setButton.className = "btn btn-edit btn-sm mr-2";
  setButton.innerHTML = "⚙️";
  setButton.addEventListener("click", function () {
    editDeleteContainer.classList.toggle("hidden");
  });

  var editButton = document.createElement("button");
  editButton.className = "btn btn-edit btn-sm mr-2 hide";
  editButton.innerHTML = "✏️";
  editButton.addEventListener("click", function () {
    document.getElementById("note-content").value = noteContent;
    document
      .getElementById("note-content")
      .setAttribute("data-note-id", noteId);
  });

  var deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-edit btn-sm hide text-center";
  deleteButton.innerHTML = "🗑️";
  deleteButton.addEventListener("click", function () {
    $("#deleteModal").modal("show");
    var deleteNoteButton = document.getElementById("deleteNote");
    deleteNoteButton.addEventListener("click", function () {
      li.parentNode.removeChild(li);
      localStorage.removeItem(noteKeyPrefix + noteId);
      $("#deleteModal").modal("hide");
    });
  });

  var editDeleteContainer = document.createElement("div");
  editDeleteContainer.className = "float-right hidden";
  editDeleteContainer.appendChild(editButton);
  editDeleteContainer.appendChild(deleteButton);

  var setContainer = document.createElement("div");
  setContainer.className = "float-right";
  setContainer.appendChild(setButton);

  li.appendChild(editDeleteContainer);
  li.appendChild(setContainer);

  return li;
}

function updateNoteColor(color) {
  var noteItem = document.getElementById("note-content");
  noteItem.style.backgroundColor = color;
  var noteColor = document.getElementById("note-content").style.backgroundColor;
  noteColor = rgbToHex(noteColor);
  var noteId = noteItem.getAttribute("data-note-id");
  if (noteId) {
    var noteData = JSON.parse(localStorage.getItem(noteKeyPrefix + noteId));
    noteData.color = color;
    localStorage.setItem(noteKeyPrefix + noteId, JSON.stringify(noteData));
  }
}

for (var i = 0; i < colorButtons.length; i++) {
  colorButtons[i].addEventListener("click", handleColorButtonClick);
}

document.getElementById("save-button").addEventListener("click", function () {
  var noteContent = document.getElementById("note-content").value.trim(); // Trim leading and trailing whitespace
  if (noteContent.trim() !== "") {
    var noteId = document
      .getElementById("note-content")
      .getAttribute("data-note-id");
    var noteColor =
      document.getElementById("note-content").style.backgroundColor;
    noteColor = rgbToHex(noteColor);
    if (noteId) {
      // Update existing note
      var noteItem = document.getElementById(noteId);
      noteItem.querySelector(".note-content").innerHTML = noteContent;
      updateNoteColor(noteId, noteColor);
      localStorage.setItem(
        noteKeyPrefix + noteId,
        JSON.stringify({ content: noteContent, color: noteColor })
      );
      // Refresh the page
      location.reload();
    } else {
      // Create new note
      noteId = Date.now(); // Generate a unique ID for the note
      var noteItem = createNoteItem(noteId, noteContent, noteColor);
      document.getElementById("note-list").appendChild(noteItem);
      localStorage.setItem(
        noteKeyPrefix + noteId,
        JSON.stringify({ content: noteContent, color: noteColor })
      );
      // Refresh the page
      location.reload();
    }
    document.getElementById("note-content").value = "";
    document.getElementById("note-content").removeAttribute("data-note-id");
  }
});

// Function to export notes as CSV
function exportNotesAsCSV() {
  var csvContent = "";

  // Add the CSV header
  var header = ["NoteId", "NoteContent", "NoteColor"];
  csvContent += header.join(",") + "\n";

  // Iterate over the notes and add them to the CSV content
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith(noteKeyPrefix)) {
      var noteId = key.substring(noteKeyPrefix.length);
      var noteData = JSON.parse(localStorage.getItem(key));
      var noteContent = noteData.content;
      var noteColor = noteData.color || "#ffffff"; // Default color if not set

      // Convert RGB color value to hex

      var row = [noteId, noteContent, noteColor];

      csvContent += '"' + row.join('","') + '"\n';
    }
  }

  // Create a Blob object with the CSV content
  var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a link element and set the Blob object as its href
  var link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", "notes.csv");
  document.body.appendChild(link);

  // Trigger the click event to download the CSV file
  link.click();
  document.body.removeChild(link);
}
// Function to import notes from CSV
function importNotesFromCSV(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var importedData = e.target.result;
      if (importedData) {
        var rows = importedData.split(/\r?\n/);
        var importedNotes = [];
        for (var i = 1; i < rows.length; i++) {
          var row = rows[i].trim();
          if (row !== "") {
            var cells = row.split(",");
            var noteId = cells[0].replace(/"/g, "");
            var noteContent = cells[1].replace(/"/g, "");
            var noteColor = cells[2].replace(/"/g, "");
            importedNotes.push({
              id: noteId,
              content: noteContent,
              color: noteColor,
            });
          }
        }
        resolve(importedNotes);
      } else {
        reject(new Error("No data found in the CSV file."));
      }
    };
    reader.onerror = function () {
      reject(new Error("Error occurred while reading the CSV file."));
    };
    reader.readAsText(file);
  });
}

// Attach event listener to export button
exportButton.addEventListener("click", function () {
  exportNotesAsCSV();
});

// Attach event listener to import button
importButton.addEventListener("click", function () {
  importFile.click();
});

// Function to save note to local storage
function saveNoteToLocalStorage(noteId, noteContent, noteColor) {
  return new Promise(function (resolve) {
    var noteData = {
      content: noteContent,
      color: noteColor,
    };
    localStorage.setItem(noteKeyPrefix + noteId, JSON.stringify(noteData));
    resolve();
  });
}

// Attach event listener to import file input
importFile.addEventListener("change", function (event) {
  var file = event.target.files[0];
  importNotesFromCSV(file)
    .then(function (importedNotes) {
      // Import notes
      importedNotes.forEach(function (note) {
        var noteId = note.id;
        var noteContent = note.content;
        var noteColor = note.color;
        var noteItem = createNoteItem(noteId, noteContent, noteColor);
        document.getElementById("note-list").appendChild(noteItem);
        saveNoteToLocalStorage(noteId, noteContent, noteColor).then(
          function () {
            console.log("Note imported and saved:", noteContent);
          }
        );
      });
      console.log("All notes imported successfully.");
    })
    .catch(function (error) {
      console.error("Error importing notes:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  // Load all saved notes from local storage
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith(noteKeyPrefix)) {
      try {
        var noteId = key.substring(noteKeyPrefix.length);
        var noteData = JSON.parse(localStorage.getItem(key));
        var noteContent = noteData.content;
        var noteColor = noteData.color || "#ffffff"; // Default color if not set
        var noteItem = createNoteItem(noteId, noteContent, noteColor);
        document.getElementById("note-list").appendChild(noteItem);
      } catch (error) {
        console.error("Error parsing note data:", error);
      }
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
  $("#clearModal").modal("show");
  var clearAllNotesButton = document.getElementById("clearAll");
  clearAllNotesButton.addEventListener("click", function () {
    clearAllNotes();

    $("#clearModal").modal("hide");
  });
});

function clearAllNotes() {
  // Clear all notes from the note list
  var noteList = document.getElementById("note-list");
  noteList.innerHTML = "";

  // Retrieve all note keys with the "note_" prefix
  var noteKeys = [];
  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith(noteKeyPrefix)) {
      noteKeys.push(key);
    }
  }

  // Asynchronously remove notes from local storage
  var removalPromises = noteKeys.map(function (key) {
    return new Promise(function (resolve) {
      localStorage.removeItem(key);
      resolve();
    });
  });

  // Wait for all removal promises to resolve
  Promise.all(removalPromises).then(function () {
    console.log("All notes cleared successfully.");
    // Perform any additional actions after all notes are cleared
  });
}

// function clearAllNotes() {
//   // Clear all notes from local storage
//   for (var i = 0; i < localStorage.length; i++) {
//     var key = localStorage.key(i);
//     if (key.startsWith(noteKeyPrefix)) {
//       localStorage.removeItem(key);
//     }
//   }

//   // Clear all notes from the note list
//   var noteList = document.getElementById('note-list');
//   noteList.innerHTML = '';

// }

window.addEventListener("DOMContentLoaded", function () {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("android")) {
    var titleElement = document.getElementsByClassName("app-title");
    if (titleElement) {
      titleElement.style.display = "none";
    }
  }
});

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
  fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var recipe = data.meals[0];
      var recipeName = recipe.strMeal || "Unknown";
      var recipeCategory = recipe.strCategory || "Unknown";
      var recipeArea = recipe.strArea || "Unknown";
      var recipeInstructions = recipe.strInstructions || "Unknown";

      var ingredients = [];
      // Collect up to 20 ingredients
      for (let i = 1; i <= 20; i++) {
        var ingredient = recipe["strIngredient" + i];
        var measure = recipe["strMeasure" + i];
        if (ingredient && measure) {
          ingredients.push(measure + " " + ingredient);
        }
      }

      var recipeInfo =
        "Recipe: " +
        recipeName +
        "\n" +
        "Category: " +
        recipeCategory +
        "\n" +
        "Area: " +
        recipeArea +
        "\n\n" +
        "Ingredients:\n" +
        ingredients.join("\n") +
        "\n\n" +
        "Instructions:\n" +
        recipeInstructions;

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = recipeInfo;
    })
    .catch(function (error) {
      console.log("An error occurred while fetching the random recipe:", error);
    });
}

document
  .getElementById("random-recipe-button")
  .addEventListener("click", function () {
    getRandomRecipe();
  });

function getRandomCountryInfo() {
  fetch("https://restcountries.com/v3.1/all")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var randomIndex = Math.floor(Math.random() * data.length);
      var country = data[randomIndex];

      var countryName = country.name.common || "Unknown";
      var countryCapital = country.capital || "Unknown";
      var countryPopulation = country.population || "Unknown";
      var countryRegion = country.region || "Unknown";

      var countryInfo =
        "Country: " +
        countryName +
        "\n" +
        "Capital: " +
        countryCapital +
        "\n" +
        "Population: " +
        countryPopulation +
        "\n" +
        "Region: " +
        countryRegion;

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = countryInfo;
    })
    .catch(function (error) {
      console.log(
        "An error occurred while fetching random country information:",
        error
      );
    });
}

document
  .getElementById("random-country-button")
  .addEventListener("click", function () {
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
  fetch(
    "https://v2.jokeapi.dev/joke/Any?blacklistFlags=religious,racist,sexist,explicit,nsfw"
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var joke = data.joke || data.setup + " " + data.delivery;

      var noteContentTextArea = document.getElementById("note-content");
      noteContentTextArea.value = joke;
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

var colorButtons = document.querySelectorAll(".filter-button");

colorButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var selectedColor = button.getAttribute("data-color");
    console.log(selectedColor);

    var noteItems = document.querySelectorAll(".list-group-item");
    noteItems.forEach(function (note) {
      var noteColor = note.style.backgroundColor; // Set the note item background color
      noteColor = rgbToHex(noteColor);
      console.log(noteColor);
      if (selectedColor === "all" || noteColor === selectedColor) {
        note.classList.remove("hide");
      } else {
        note.classList.add("hide");
      }
    });
  });
});
