// Retrieve the collections from local storage
let collections = JSON.parse(localStorage.getItem('collections')) || {};

// Select the playList container
const playListContainer = document.getElementById('playList');

// Render the collections
renderCollections();

// Function to render the collections
function renderCollections() {
    playListContainer.innerHTML = "";

    for (let collectionName in collections) {
        const collection = collections[collectionName];
        const collectionElement = document.createElement('div');
        collectionElement.classList.add('collection');

        const collectionTitle = document.createElement('h4');
        collectionTitle.textContent = collectionName;

        // Add delete button for the collection
        const deleteCollectionButton = document.createElement('button');
        deleteCollectionButton.textContent = 'Delete Collection';
        deleteCollectionButton.classList.add('delete-collection-button');
        deleteCollectionButton.addEventListener('click', () => deleteCollection(collectionName));

        collectionTitle.appendChild(deleteCollectionButton);

        const shareCollectionButton = document.createElement('button');
        shareCollectionButton.textContent = 'Share Collection';
        shareCollectionButton.classList.add('share-collection-button');
        shareCollectionButton.addEventListener('click', () => shareCollection(collectionName));
        collectionTitle.appendChild(shareCollectionButton);

        collectionElement.appendChild(collectionTitle);

        collection.forEach((movie, index) => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('playList-item');
            movieItem.textContent = movie.title;

            // Add delete button for each movie
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => deleteMovie(collectionName, index));

            movieItem.appendChild(deleteButton);
            collectionElement.appendChild(movieItem);
        });

        playListContainer.appendChild(collectionElement);
    }
}

// Function to delete a movie from a collection
function deleteMovie(collectionName, index) {
    collections[collectionName].splice(index, 1);

    // If the collection is empty after removal, delete the collection
    if (collections[collectionName].length === 0) {
        delete collections[collectionName];
    }

    localStorage.setItem('collections', JSON.stringify(collections)); // Update the local storage
    renderCollections(); // Render the updated collections
}

// Function to delete a collection
function deleteCollection(collectionName) {
    delete collections[collectionName];

    localStorage.setItem('collections', JSON.stringify(collections)); // Update the local storage
    renderCollections(); // Render the updated collections
}


function shareCollection(collectionName){
    const collections = JSON.parse(localStorage.getItem('collections'))
    const collection = [{
        name: collectionName,
        movies: collections[collectionName]
    }]

    const url = location.href+"/"+JSON.stringify(collection)
    alert("Copy this url and share it with your friends: "+url)
}