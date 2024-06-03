const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');

async function loadMovies(searchTerm) {
    const URL = `https://omdbapi.com/?s=${searchTerm}&page=1&apikey=684697b1`;
    const res = await fetch(`${URL}`);
    const data = await res.json();
    if (data.Response === "True") displayMovieList(data.Search);
}

function findMovies() {
    let searchTerm = movieSearchBox.value.trim();
    if (searchTerm.length > 0) {
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        searchList.classList.add('hide-search-list');
    }
}

function displayMovieList(movies) {
    searchList.innerHTML = "";
    for (let idx = 0; idx < movies.length; idx++) {
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID;
        movieListItem.classList.add('search-list-item');
        let moviePoster = (movies[idx].Poster !== "N/A") ? movies[idx].Poster : "image_not_found.png";

        movieListItem.innerHTML = `
        <div class="search-item-thumbnail">
            <img src="${moviePoster}">
        </div>
        <div class="search-item-info">
            <h3>${movies[idx].Title}</h3>
            <p>${movies[idx].Year}</p>
        </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}

function loadMovieDetails() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            searchList.classList.add('hide-search-list'); // Hide the search list
            movieSearchBox.value = "";
            const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=684697b1`);
            const movieDetails = await result.json();
            displayMovieDetails(movieDetails);
            addToHistory(movieDetails);
        });
    });
}

function displayMovieDetails(details) {
    resultGrid.innerHTML = `
    <div class="movie-poster">
        <img src="${(details.Poster !== "N/A") ? details.Poster : "image_not_found.png"}" alt="movie poster">
    </div>
    <div class="movie-info">
        <h3 class="movie-title">${details.Title}</h3>
        <ul class="movie-misc-info">
            <li class="year">Year: ${details.Year}</li>
            <li class="rated">Ratings: ${details.Rated}</li>
            <li class="released">Released: ${details.Released}</li>
        </ul>
        <p class="genre"><b>Genre:</b> ${details.Genre}</p>
        <p class="writer"><b>Writer:</b> ${details.Writer}</p>
        <p class="plot"><b>Plot:</b> ${details.Plot}</p>
        <p class="language"><b>Language:</b> ${details.Language}</p>
        <p class="awards"><b><i class="fas fa-award"></i></b> ${details.Awards}</p>
        <button class="add-to-list" onclick="addToList('${details.Title}', '${details.imdbID}')">Add to List</button>
    </div>
    `;
}

// Function to add the movie to the browsing history
function addToHistory(movieDetails) {
    // Retrieve the existing history from local storage or create a new array
    let history = JSON.parse(localStorage.getItem('history')) || [];

    // Check if the movie is already in the history
    if (!history.some(movie => movie.imdbID === movieDetails.imdbID)) {
        // Add the movie to the history
        history.push(movieDetails);

        // Store the updated history back to local storage
        localStorage.setItem('history', JSON.stringify(history));
    }
}

// Function to add a movie to a named collection
function addToList(title, imdbID) {
    let collectionName = prompt("Enter the name of the collection:");
    if (!collectionName) {
        alert("Collection name cannot be empty.");
        return;
    }

    // Get the existing collections from local storage or create a new object if it doesn't exist
    let collections = JSON.parse(localStorage.getItem('collections')) || {};

    // Check if the collection exists; if not, create a new one
    if (!collections[collectionName]) {
        collections[collectionName] = [];
    }

    // Check if the movie is already in the collection
    if (collections[collectionName].some(movie => movie.imdbID === imdbID)) {
        alert(`This movie is already in the ${collectionName} collection!`);
        return;
    }

    // Add the movie to the collection
    collections[collectionName].push({ title: title, imdbID: imdbID });

    // Save the updated collections back to local storage
    localStorage.setItem('collections', JSON.stringify(collections));

    // Alert the user that the movie has been added successfully
    alert(`${title} has been added to the ${collectionName} collection!`);
}
