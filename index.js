// // Codigo que utiliza la API de The Movie Database (TMDb) para mostrar listas de películas,
// // permitir búsquedas de películas por título y cambiar entre diferentes vistas (cuadrícula y lista)...

// Objeto de configuración con la clave de la API, el idioma y la URL base de la API.
const config = {
  apiKey: "15d2ea6d0dc1d476efbca3eba2b9bbfb",
  langIso: "es-ES",
  baseUrl: "https://api.themoviedb.org/3",
};

// Objeto que define los tipos de lista de películas disponibles.
const movieListType = {
  nowPlaying: "now_playing",
  popular: "popular",
  topRated: "top_rated",
  upcoming: "upcoming",
};

// Función para filtrar los datos de las películas obtenidas de la API.
function filterMoviesData(movies) {
  return movies.map((movie) => {
    const { id, title, overview, poster_path, release_date, vote_average } = movie;
    return {
      cover: poster_path,
      title,
      description: overview,
      year: release_date.split("-").shift(),
      rating: vote_average,
      id,
    };
  });
}

// Función para obtener datos de la lista de películas utilizando la API.
async function getListMoviesData(movieListType, page = 1) {
  const movieListUrl = `${config.baseUrl}/movie/${movieListType}?language=${config.langIso}&api_key=${config.apiKey}&page=${page}`;
  const response = await fetch(movieListUrl);
  const data = await response.json();

  // Verificar si la solicitud fue exitosa.
  if (data?.success === false) {
    throw new Error(`Error(getListMoviesData): ${data.status_message}`);
  }

  return filterMoviesData(data?.results ?? []);
}

// Función para obtener los créditos de una película por su ID.
async function fetchMovieCredits(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${config.apiKey}&language=${config.langIso}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch movie credits');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie credits:', error.message);
    throw error;
  }
}

// Cuando el DOM esté cargado, ejecutar el código.
document.addEventListener("DOMContentLoaded", function () {
  // Obtener elementos del DOM
  const moviesListContainer = document.getElementById("movies-list");
  const movieDetailContainer = document.getElementById("movie-detail");
  const gridViewButton = document.getElementById("grid-view-button");
  const listViewButton = document.getElementById("list-view-button");
  const scrollToTopButton = document.getElementById("scroll-to-top-button");
  const movieListDropdown = document.getElementById("movie-list-dropdown");
  const searchButton = document.getElementById("searchButton");
  const clearButton = document.getElementById("clearButton");
  const searchInput = document.getElementById("searchInput");
  const searchResultsDiv = document.getElementById("searchResults");

  let currentView = "grid"; // Vista actual: cuadrícula o lista
  let currentListType = "now_playing"; // Tipo de lista actual
  let movieList = []; // Lista de películas obtenida de la API

  // Función para renderizar las películas en la vista
  function renderMovies() {
    // Limpia el contenedor de películas
    moviesListContainer.innerHTML = "";

    // Itera sobre la lista de películas y crea elementos HTML para cada una
    movieList.forEach((movie) => {
      const movieElement = document.createElement("div");
      movieElement.classList.add("movie", currentView === "grid" ? "grid" : "list");

      const imgElement = document.createElement("img");
      imgElement.classList.add("movie-poster");
      imgElement.src = `https://media.themoviedb.org/t/p/w220_and_h330_face/${movie.cover}`;
      imgElement.alt = movie.title;

      const movieInfoElement = document.createElement("div");
      movieInfoElement.classList.add("movie-info");

      const titleElement = document.createElement("h5");
      titleElement.classList.add("movie-title");
      titleElement.textContent = movie.title;

      const yearElement = document.createElement("p");
      yearElement.classList.add("movie-year");
      yearElement.textContent = `Año: ${movie.year}`;

      const descriptionElement = document.createElement("p");
      descriptionElement.classList.add("movie-description");
      descriptionElement.textContent = movie.description;

      const ratingElement = document.createElement("p");
      ratingElement.classList.add("movie-rating");
      ratingElement.textContent = `Rating: ${movie.rating}`;

      // Agregar eventos de clic para mostrar detalles de la película
      movieElement.addEventListener("click", () => {
        showMovieDetails(movie);
      });

      movieInfoElement.appendChild(titleElement);
      movieInfoElement.appendChild(ratingElement);
      movieInfoElement.appendChild(yearElement);
      movieInfoElement.appendChild(descriptionElement);

      movieElement.appendChild(imgElement);
      movieElement.appendChild(movieInfoElement);

      moviesListContainer.appendChild(movieElement);
    });
  }

  // Función para obtener los detalles de una película por su ID
  async function fetchMovieDetails(movieId) {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${config.apiKey}&language=${config.langIso}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching movie details:', error.message);
      throw error;
    }
  }

  // Función para mostrar los detalles de una película y ocultar el resto
  async function showMovieDetails(movie) {
    try {
      // Ocultar la lista de películas y mostrar los detalles de la película seleccionada
      moviesListContainer.style.display = "none";
      movieDetailContainer.style.display = "block";

      // Hacer scroll hacia arriba
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Obtener los detalles adicionales de la película, incluido el backdrop_path
      const movieDetails = await fetchMovieDetails(movie.id);
      const backdropPath = movieDetails.backdrop_path;

      // Obtener los créditos de la película
      const credits = await fetchMovieCredits(movie.id);
      const cast = credits.cast.slice(0, 6); // Obtener los primeros 6 actores
      const director = credits.crew.find(person => person.job === "Director");

      // Construir el detalle HTML 
      const detailHTML = `
  <div class="card mb-3" style="background-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5)), url('https://image.tmdb.org/t/p/original/${backdropPath}'); background-size: cover; background-position: center; color: white;">
      <div class="row g-0">
          <div class="col-md-4">
              <img src="https://image.tmdb.org/t/p/w500/${movie.cover}" class="img-fluid rounded-start movie-poster" alt="${movie.title}">
          </div>
          <div class="col-md-8">
              <div class="card-body" style="font-size: 16px; font-weight: bold; text-shadow: rgb(0, 0, 0) 2px 2px 4px;">
                  <h3 class="card-title">${movie.title}</h3>
                  <p class="card-text">Año: ${movie.year}</p>
                  <p class="card-text" style="line-height: 1.5; letter-spacing: 1px;">Descripción: ${movie.description}</p>
                  <p class="card-text">Rating: ${movie.rating}</p>
                  <h6 class="card-subtitle mb-2" style="color: rgb(252,252,252); font-weight: bold; letter-spacing: 1px;">Director:</h6>
                  <div class="director d-flex flex-column align-items-center mt-2" style="letter-spacing: 1px;">
                  ${director && director.profile_path ? `<img src="https://image.tmdb.org/t/p/w200/${director.profile_path}" class="img-fluid rounded-circle director-image me-3" alt="${director.name}">` : ""}
                  <p class="card-text" style="color: rgb(252,252,252); font-weight: bold; margin-bottom: 0;">${director ? director.name : "No disponible"}</p></div>
                  <h6 class="card-subtitle mb-2" style="color: rgb(252,252,252); font-weight: bold; letter-spacing: 1px;">Actores:</h6>
                  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 justify-content-center">
                      ${cast.map(actor => `
                          <div class="col mb-2">
                              <div class="actor text-center" style="letter-spacing: 1px;">
                                  ${actor.profile_path ? `<img src="https://image.tmdb.org/t/p/w200/${actor.profile_path}" class="img-fluid rounded-circle actor-image mb-2" alt="${actor.name}">` : ""}
                                  <p class="card-text" style="color: rgb(252,252,252); font-weight: bold;">${actor.name} (${actor.character})</p>
                              </div>
                          </div>`).join("")
        }
                  </div>
                  <button id="back-button" type="button" class="btn btn-warning">Regresar</button>
              </div>
          </div>
      </div>
  </div>
`;

      // Agregar los detalles al contenedor de detalles de la película
      movieDetailContainer.innerHTML = detailHTML;

      // Agregar un evento de clic al botón de regreso
      const backButton = document.getElementById("back-button");
      backButton.addEventListener("click", () => {
        // Ocultar los detalles de la película
        movieDetailContainer.style.display = "none";

        // Mostrar la lista de películas
        moviesListContainer.style.display = "block";

        // Hacer scroll suave hacia arriba
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (error) {
      console.error("Error al obtener los detalles de la película:", error.message);
    }
  }


  // Función para cargar las películas al iniciar
  async function loadMovies() {
    try {
      // Obtener la lista de películas
      movieList = await getListMoviesData(currentListType);
      // Renderizar las películas en la vista
      renderMovies();
    } catch (error) {
      console.error("Error al cargar las películas:", error.message);
    }
  }

  // Event listeners para cambiar entre las vistas de cuadrícula y lista
  gridViewButton.addEventListener("click", function () {
    if (currentView !== "grid") {
      currentView = "grid";
      gridViewButton.classList.add("active");
      listViewButton.classList.remove("active");
      renderMovies();
    }
  });

  listViewButton.addEventListener("click", function () {
    if (currentView !== "list") {
      currentView = "list";
      gridViewButton.classList.remove("active");
      listViewButton.classList.add("active");
      renderMovies();
    }
  });

  // Event listener para cambiar el tipo de lista de películas
  movieListDropdown.addEventListener("change", function () {
    currentListType = this.value;
    loadMovies();
  });

  // Event listener para el botón de búsqueda
  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.trim();
    if (searchTerm !== "") {
      searchMovies(searchTerm);
    }
  });

  // Función para buscar películas por término de búsqueda
  async function searchMovies(searchTerm) {
    try {
        // Limpiar el contenedor de resultados de búsqueda directamente aquí
        searchResultsDiv.innerHTML = "";

        const searchUrl = `${config.baseUrl}/search/movie?query=${encodeURIComponent(searchTerm)}&api_key=${config.apiKey}`;
        const response = await fetch(searchUrl);
        const searchData = await response.json();

        if (searchData.results && searchData.results.length > 0) {
            // Asegúrate de ocultar y mostrar los contenedores adecuados
            moviesListContainer.style.display = "none";
            movieDetailContainer.style.display = "none";
            displaySearchResults(searchData.results);
            clearButton.style.display = "block";
        } else {
            searchResultsDiv.textContent = "No se encontraron resultados.";
            clearButton.style.display = "none";
        }
    } catch (error) {
        console.error("Error al buscar películas:", error.message);
    }
}


  // Función para mostrar los resultados de la búsqueda
  function displaySearchResults(results) {
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = ""; // Limpiar resultados anteriores

    if (results.length === 0) {
      searchResultsDiv.textContent = "No se encontraron resultados.";
      return;
    }

    // Agregar clases Bootstrap al contenedor de resultados de búsqueda
    searchResultsDiv.classList.add("row", "row-cols-1", "row-cols-md-4", "g-4");

    results.forEach((movie) => {
      const movieTitle = movie.title;
      const moviePoster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/150";
      const movieYear = movie.release_date
        ? movie.release_date.substring(0, 4)
        : "Desconocido";
      const movieOverview = movie.overview
        ? movie.overview
        : "Descripción no disponible";

      const movieElement = document.createElement("div");
      movieElement.classList.add("col");
      movieElement.innerHTML = `
            <div class="card h-100">
                <img src="${moviePoster}" class="card-img-top" alt="${movieTitle}">
                <div class="card-body">
                    <h5 class="card-title">${movieTitle}</h5>
                    <p class="card-text">Descripción: ${movieOverview}</p>
                    <p class="card-text">Año: ${movieYear}</p>
                </div>
            </div>
        `;
      searchResultsDiv.appendChild(movieElement);
    });
  }

  // Event listener para el botón de limpiar la búsqueda
  clearButton.addEventListener("click", function () {
    searchInput.value = "";
    searchResultsDiv.innerHTML = "";
    clearButton.style.display = "none";
    
    // Mostrar nuevamente el contenedor principal de las películas y cualquier otro contenido relevante
    moviesListContainer.style.display = "block";
    // Si tienes otros contenedores que mostrar, añádelos aquí
  });

  // Cargar las películas al iniciar la aplicación
  loadMovies();

  // Event listener para mostrar/ocultar el botón de volver arriba cuando se desplaza la página
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 100) {
      scrollToTopButton.style.display = "block";
    } else {
      scrollToTopButton.style.display = "none";
    }
  });

  // Event listener para volver arriba cuando se hace clic en el botón
  scrollToTopButton.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});


