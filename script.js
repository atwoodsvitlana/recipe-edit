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

    console.error("Error fetching recipes:", err);
    statusDiv.textContent = "Unable to fetch recipes. Please try again.";

    return {
      success: false,
      recipes: []
    };
  }
}



const renderRecipes = (arr) => {
  const start = (currentPage - 1) * recipesPerPage;
  const end = start + recipesPerPage;
  const paginatedRecipes = arr.slice(start, end);

  recipesSection.replaceChildren();

  if (arr.length === 0) {
    statusDiv.textContent = "No recipes found";
    updatePagination();
    return;
  }

  statusDiv.textContent = "";

  paginatedRecipes.forEach((recipe) => {
    const {
      id,
      image,
      name,
      cuisine,
      rating,
      difficulty
    } = recipe;

    // Create the card
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    // Create the favorite button
    const heartButton = document.createElement("button");
    heartButton.classList.add("heart");

    const isFavorite = favorites.some(
      (item) => item.id === id
    );

    heartButton.textContent = isFavorite ? "❤️" : "🤍";
    heartButton.setAttribute("aria-label",
      isFavorite
        ? `Remove ${name} from favorites`
        : `Add ${name} to favorites`
    );

    heartButton.addEventListener("click", () => {
      toggleFavorite(id);
    });

    // Create the recipe image
    const recipeImage = document.createElement("img");
    recipeImage.src = image;
    recipeImage.alt = name;
    recipeImage.loading = "lazy";

    // Create the recipe name
    const heading = document.createElement("h2");
    heading.textContent = name;

    // Create the cuisine
    const cuisineText = document.createElement("p");
    cuisineText.textContent = `Cuisine: ${cuisine}`;

    // Create the rating
    const ratingText = document.createElement("p");
    ratingText.textContent = `${rating} ⭐`;

    // Create the difficulty
    const difficultyText = document.createElement("p");
    difficultyText.textContent = `Difficulty: ${difficulty}`;

    // Create the details button
    const detailsButton = document.createElement("button");
    detailsButton.classList.add("view-details-btn");
    detailsButton.textContent = "View Details";

    detailsButton.addEventListener("click", () => {
      showDetails(id);
    });

    // Assemble the card
    card.append(
      heartButton,
      recipeImage,
      heading,
      cuisineText,
      ratingText,
      difficultyText,
      detailsButton
    );

    recipesSection.appendChild(card);
  });

  updatePagination();
  pageDisplay.textContent = currentPage;
};




const showDetails = (recipeId) => {
  const recipe = allRecipes.find(
    (item) => item.id === recipeId
  );

  if (!recipe) return;

  const {
    image,
    name,
    cuisine,
    rating,
    difficulty,
    prepTimeMinutes,
    cookTimeMinutes,
    ingredients,
    instructions
  } = recipe;

  modalContent.replaceChildren();

  const closeButton = document.createElement("button");
  closeButton.id = "close-modal";
  closeButton.classList.add("close-btn");
  closeButton.type = "button";
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close recipe details");

  closeButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

modalContent.appendChild(closeButton);

  const detailsCard = document.createElement("div");
  detailsCard.classList.add("details-card");

  const heading = document.createElement("h2");
  heading.textContent = name;

  const recipeImage = document.createElement("img");
  recipeImage.src = image;
  recipeImage.alt = name;

  const createParagraph = (text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  };

  const ingredientsHeading = document.createElement("h3");
  ingredientsHeading.textContent = "Ingredients";

  const ingredientsList = document.createElement("ul");
  ingredientsList.classList.add("padding");

  ingredients.forEach((ingredient) => {
    const item = document.createElement("li");
    item.textContent = ingredient;
    ingredientsList.appendChild(item);
  });

  const instructionsHeading = document.createElement("h3");
  instructionsHeading.textContent = "Instructions";

  const instructionsList = document.createElement("ol");

  instructions.forEach((instruction) => {
    const item = document.createElement("li");
    item.textContent = instruction;
    instructionsList.appendChild(item);
  });

  detailsCard.append(
    heading,
    recipeImage,
    createParagraph(`Cuisine: ${cuisine}`),
    createParagraph(`Rating: ${rating} ⭐`),
    createParagraph(`Difficulty: ${difficulty}`),
    createParagraph(`Prep time: ${prepTimeMinutes} mins`),
    createParagraph(`Cook time: ${cookTimeMinutes} mins`),
    ingredientsHeading,
    ingredientsList,
    instructionsHeading,
    instructionsList
  );

  modalContent.appendChild(detailsCard);
  modal.classList.remove("hidden");
};


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
  try {
    favorites = JSON.parse(
      localStorage.getItem("favRecipes")
    ) || [];
  } catch (err) {
    console.error("Unable to load favorites:", err);
    favorites = [];
  }
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


modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

// Close modal with the Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.classList.add("hidden");
  }
});

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