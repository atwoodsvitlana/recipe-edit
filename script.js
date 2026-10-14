const recipesSection = document.querySelector("#recipes");
const search = document.querySelector("#search");
const sort = document.querySelector("#sort");
const statusDiv = document.querySelector("#status");
const category = document.querySelector("#category");
const cuisine = document.querySelector("#cuisine");

const pageDiv = document.querySelector(".page-btns");
const prevBtn = document.querySelector("#prev");
const nextBtn = document.querySelector("#next");
const pageDisplay = document.querySelector("#page");

const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const closeModal = document.querySelector("#close-modal");

let recipes = [];
let favorites = [];
let allRecipes = [];
let filteredRecipes = [];

let currentPage = 1;
const recipesPerPage = 8;



const fetchAllRecipes = async() => {
  statusDiv.textContent = "Loading recipes..."

  try {
    const res = await fetch("https://dummyjson.com/recipes");

    if(!res.ok) {
      throw new Error("Failed fetching all recipes");
    }

    const data = await res.json();

    statusDiv.textContent = "";

    return {
      success: true,
      recipes: data.recipes || []
    }

  } catch(err) {
    console.log(err);

    return {
      success: false,
      recipes: []
    };
  }
}


const renderRecipes = (arr) => {

  const start = (currentPage - 1) * recipesPerPage;
  const end = start + recipesPerPage;

  if(arr.length === 0) {
    recipesSection.innerHTML = "";
    statusDiv.textContent = "No recipes found";
    return;
  }

  statusDiv.textContent = "";

  recipesSection.innerHTML = arr.slice(start, end).map(({id, image, name, cuisine, rating, difficulty}) =>{ 
    let recipe = favorites.find(item => item.id === id)
    let heart = recipe ? "❤️" : "🤍";
    return `
    <div class="recipe-card">
      <button class="heart" data-index=${id}>${heart}</button>
      <img src=${image} alt=${name}>
      <h2>${name}</h2>
      <p>Cuisine: ${cuisine}</p>
      <p>${rating} 🌟</p>
      <p>Difficulty: ${difficulty}</p>
      <button class="view-details-btn" data-id=${id}><span>View Details</span></button>
    </div>
  `}).join("");

  updatePagination();

  pageDisplay.textContent = currentPage;

  document.querySelectorAll(".view-details-btn").forEach(button => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      showDetails(id);
    })
  })

  document.querySelectorAll(".heart").forEach(button => {
    button.addEventListener("click", () => {
      const favRecipe = Number(button.dataset.index);
      toggleFavorite(favRecipe);
    })
  })
}


const showDetails = (recipeId) => {
  
const recipe = allRecipes.find(item => item.id === recipeId);

if (!recipe) return;

const {
  image, name, cuisine, rating, difficulty,
  prepTimeMinutes, cookTimeMinutes, ingredients, instructions
} = recipe;
  const ingredientsArr = ingredients.map(ingredient => `<li>${ingredient}</li>`).join("");
  const instructionsArr = instructions.join(" ");

  modal.classList.remove("hidden");
  modalContent.innerHTML = `
    <div class="details-card">
      <button class="close-btn">x</button>
      <img src=${image} alt=${name}>
      <p>Cuisine: ${cuisine}</p>
      <p> ${rating} ⭐</p>
      <p>Difficulty: ${difficulty}</p>
      <p>Prep time: ${prepTimeMinutes} mins</p>
      <p>Cook time: ${cookTimeMinutes} mins</p>
      <p>Ingredients: </p>
      <ul class="padding">${ingredientsArr}</ul>
      <p>Instructions:</p>
      <p>${instructionsArr}</p>
    </div>
  `

  document.querySelectorAll(".close-btn").forEach(button => {
    button.addEventListener("click", () => {
      modal.classList.add("hidden");
    })
  })
}


const renderCategories = () => {
  const categories = new Set(allRecipes.map(recipe => recipe.mealType).flat());
  console.log(categories);
  categories.forEach(categoryName => {
    const newOption = new Option(categoryName, categoryName);
    category.add(newOption);
  })
}
  
const renderCuisines = () => {
  const cuisines = new Set(allRecipes.map(recipe => recipe.cuisine));

  cuisines.forEach(cuisineName => {
    const newOption = new Option(cuisineName, cuisineName);
    cuisine.add(newOption);
  })
}



const handleSearch = () => {
  currentPage = 1;
  filteredRecipes = [...allRecipes];

  if (search.value !== "") {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  if(category.value !== "all") {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.mealType.some(meal => meal === category.value))
  }

  if(cuisine.value !== "all") {
    console.log(filteredRecipes)
    filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === cuisine.value)
  }

  if(sort.value === "name-asc") {
    filteredRecipes = filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));
  }

  if(sort.value === "name-desc") {
    filteredRecipes = filteredRecipes.sort((a, b) => b.name.localeCompare(a.name));
  }

  if(sort.value === "rating-desc") {
    filteredRecipes = filteredRecipes.sort((a, b) => b.rating - a.rating);
  }

  if(sort.value === "rating-asc") {
    filteredRecipes = filteredRecipes.sort((a, b) => a.rating - b.rating);
  }

  renderRecipes(filteredRecipes);
};


const loadFavorites = () => {
  favorites = JSON.parse(
    localStorage.getItem("favRecipes")
  ) || [];
};

const saveFavorites = () => {
  localStorage.setItem("favRecipes", JSON.stringify(favorites))
}

const toggleFavorite = (recipeId) => {
  const existingRecipe = favorites.find(item => item.id === recipeId);

  if(existingRecipe){
    favorites = favorites.filter(
      item => item.id !== recipeId
    );
  } else {
    const recipe = allRecipes.find(item => item.id === recipeId);
    
    if(recipe) {
      favorites.push(recipe);
    }
  }
  saveFavorites();
  renderRecipes(filteredRecipes);
};




const updatePagination = () => {
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

    pageDisplay.textContent = currentPage;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
};


prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;

        renderRecipes(filteredRecipes);
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

    if (currentPage < totalPages) {
        currentPage++;

        renderRecipes(filteredRecipes);
    }
});

search.addEventListener("input",  handleSearch);
sort.addEventListener("change",  handleSearch);
category.addEventListener("change", handleSearch);
cuisine.addEventListener("change", handleSearch);


const init = async () => {
  loadFavorites();
  const result = await fetchAllRecipes();
  console.log(result)

  if(result.success) {
    allRecipes = result.recipes;
    
    renderCategories();
    renderCuisines();

    handleSearch();
  } else {
    recipesSection.innerHTML = "";
    statusDiv.textContent = "Unable to fetch recipes";

    currentPage = 1;
    pageDiv.style.display = "none";
    pageDisplay.textContent = currentPage;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

init();