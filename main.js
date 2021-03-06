const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modalChange = document.querySelector("#modalChange");
let model = "picture"
let currentPage = 1;


//  函式

function renderPaginator() {
  let amount = filteredMovies.length ? filteredMovies.length : movies.length;
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += ` <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li> `;
  }
  paginator.innerHTML = rawHTML;
}

function renderMovieList(data, model) {
  let rawHTML = "";
  if (model === "picture") {
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
            </div>
          </div>
        </div>
      </div>`;
    });
  } else if (model === "list") {
    data.forEach((item) => {
      rawHTML += `<div class="container d-flex justify-content-between m-2">
        <div class="body d-flex justify-content-start">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="footer"> 
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id=${item.id}>More</button>
          <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
        </div>
      </div>`
    })
  }
  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已收藏");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function getMoviesByPage(page) {
  //觀摩同學作業時發現了這個寫法 很好用
  let data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}


//監聽器

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) addToFavorite(Number(event.target.dataset.id));
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies.splice(0, filteredMovies.length);

  if (!keyword.length) {
    return alert("Please enter a valid string");
  }

  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie);
    }
  }
  page = 1;
  renderMovieList(getMoviesByPage(page), model);
  renderPaginator();
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;

  const dataPages = Number(event.target.dataset.page);
  currentPage = dataPages;
  renderMovieList(getMoviesByPage(currentPage), model);

});

modalChange.addEventListener("click", function iconClicked(event) {
  if (event.target.tagName !== "I") return;
  model = event.target.dataset.model;
  renderMovieList(getMoviesByPage(currentPage), model)
});

//讀取資料

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage), model);
  })
  .catch((err) => console.log(err));
