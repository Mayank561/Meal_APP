// Initialize event listener for document load, when loaded the updateTask() function will be called
document.addEventListener('load', ()=>{
    updateTask();
    })
    
    /**
    Get the Dom elements for toggle buttons ,sidebar, flex-box searchbar, dbObjectFavLidt, and dbLastInput;
    */
    const toggleButton = document.getElementById("toggle");
    const sidebar = document.getElementById("sidebar");
    const flexBox = document.getElementById('flex-box');
    const searchbar = document.getElementById('search-bar');
    
    /**
    Check and initialize the local storage items for favorite list and last input
    */
    const dbObjectFavList = "favouritesList";
    // Check if favouritesList exists in localStorage, if not initialize it with an empty array
    if (localStorage.getItem(dbObjectFavList) == null) {
    localStorage.setItem(dbObjectFavList, JSON.stringify([]));
    }
    
    /**
    Update the task counter with the current number of items in the favorite list.
    */
    function updateTask() {
    const favCounter = document.getElementById('total-counter');
    const db = JSON.parse(localStorage.getItem(dbObjectFavList));
    // Check if favCounter has an innerText, then update it with the number of items in favouritesList
    if (favCounter.innerText != null) {
    favCounter.innerText = db.length;
    }
    }
    
    // check if an Id is in a list of favorites
    function isFav(list, id) {
    let res = false;
    for (let i = 0; i < list.length; i++) {
    if (id == list[i]) {
    res = true;
    }
    }
    return res;
    }
    
    // some useful utility functions
    // Truncate string greater than 50
    function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
    }
    // Generates a random character string starting
    function generateOneCharString() {
    var possible = "abcdefghijklmnopqrstuvwxyz";
    return possible.charAt(Math.floor(Math.random() * possible.length));
    }
    // Function to toggle the sidebar and display the list of favorites meals...
    toggleButton.addEventListener("click", function () {
    showFavMealList();
    sidebar.classList.toggle("show");
    flexBox.classList.toggle('shrink');
    });
    
//    scroll event listener for flexBox..
    flexBox.onscroll = function () {
    
        if (flexBox.scrollTop > searchbar.offsetTop) {
            searchbar.classList.add("fixed");
    
        } else {
            searchbar.classList.remove("fixed");
        }
    };
    
    
//    Fetch meals from Api..
    
    const fetchMealsFromApi = async (url, value) => {
        const response = await fetch(`${url + value}`);
        const meals = await response.json();
        return meals;
    }
    
    
    // show meals list based on search input.
    async function showMealList() {
        const list = JSON.parse(localStorage.getItem(dbObjectFavList));
        // Retrieve the fav list from local storage 
        const inputValue = document.getElementById("search-input").value;
        // get the value of the search input field
        const url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
        // API endpoint for searching meals..
        const mealsData = await fetchMealsFromApi(url, inputValue);
        // Fetch meals data from thr API based on the search input..
        let html = '';
        // initz an empty string to store the generated HTML..
        if (mealsData.meals) {
            // check if meal data is availabe 
            html = mealsData.meals.map(element => {
                // Map over each meal in the meals data and generate HTML for each meal
    
                return `
             
                <div class="card">
                <div class="card-top"  onclick="showMealDetails(${element.idMeal}, '${inputValue}')">
                    <div class="dish-photo" >
                        <img src="${element.strMealThumb}" alt="">
                    </div>
                    <div class="dish-name">
                        ${element.strMeal}
                    </div>
                    <div class="dish-details">
                        ${truncate(element.strInstructions, 50)}
                        
                        <span class="button" onclick="showMealDetails(${element.idMeal}, '${inputValue}')">Know More</span>
                     
                    </div>
                </div>
                <div class="card-bottom">
                    <div class="like">
                    <i class="fa-solid fa-heart ${isFav(list, element.idMeal) ? 'active' : ''} " onclick="addRemoveToFavList(${element.idMeal})"></i>
                    
                    </div>
                    <div class="play">
                        <a href="${element.strYoutube}">
                            
                        </a>
                    </div>
                </div>
            </div>
                `
            }).join('');
            // join the generated HTML elements into a single string 
            document.getElementById('cards-holder').innerHTML = html;
            // update the html of card-holder element with the generated HTML..
        }
    }
    
    function addRemoveToFavList(id) {
        // get the element with the id like-button..
        const detailsPageLikeBtn = document.getElementById('like-button');
        // Retrieve the favorite list from local storage..
        let db = JSON.parse(localStorage.getItem(dbObjectFavList));
        // Initizalize a flag variable to track if the meal exists in the favorite list..
        let ifExist = false;
        for (let i = 0; i < db.length; i++) {
            //check if the meal Id matches an ID in the list
            if (id == db[i]) {
                //SET the flag variable to true if the meal exists..
                ifExist = true;
    
            }
    
        } if (ifExist) {
            // if the meal exists in the favorites list 
            db.splice(db.indexOf(id), 1);
            // remove the meal from the list 
    
        } else {  // if the meal don't exists in fav list
            db.push(id);
            // Remove the meal to the list...
    
        }
    
        localStorage.setItem(dbObjectFavList, JSON.stringify(db));
        // store the update fav list in local storage..
        if (detailsPageLikeBtn != null) {
            // check if the like-button element exists..
            // update the inner html of 'like-button' based on whether the meal is in the favorite list or not...
            detailsPageLikeBtn.innerHTML = isFav(db, id) ? 'Remove From Favourite' : 'Add To Favourite';
        }
        // call the function to show the meal list 
        showMealList();
        // call the function to show the fav meal list 
        showFavMealList();
        // call the function to update the task
        updateTask();
    }
    
    
    /**
     * Show details for a specific meal
     * @async
     * @function
     * @param {string} itemId - The ID of the meal to show details for
     * @param {string} searchInput - The search input used to fetch the related meals
     */
     
    async function showMealDetails(itemId, searchInput) {
        console.log("searchInput:...............", searchInput);
        // output the value of searchInput to the console.
        const list = JSON.parse(localStorage.getItem(dbObjectFavList));
        // Retrieve thr favorite list from local storage..
        flexBox.scrollTo({ top: 0, behavior: "smooth" });
        // scroll to the top of the flexBox element with smooth behavior..
        const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
        // API endpoint for retrieving meal details 
        const searchUrl = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
        // Api endpoint for searching meals..
        const mealList = await fetchMealsFromApi(searchUrl,searchInput);
        // fetch meals data from the API based on the search Input..
        console.log('mealslist:..........',mealList);
        // Output the meals list to the console
        let html = ''
        // Initialize an empty string to store the generated HTML..
        const mealDetails = await fetchMealsFromApi(url, itemId);
        // fetch meal details from the API based on the meal ID..
        if (mealDetails.meals) {
            // check if meal details are availabe 
            // Generate Html for displaying the meal details
            html = `
            <div class="container remove-top-margin">
                <div class="header hide">
                    <div class="title">
                        Let's Eat Something New
                    </div>
                </div>
                <div class="fixed" id="search-bar">
                    <div class="icon">
                        <i class="fa-solid fa-search "></i>
                    </div>
                    <div class="new-search-input">
                        <form onkeyup="showMealList()">
                            <input id="search-input" type="text" placeholder="Search food, receipe" />
                        </form>
                    </div>
                </div>
            </div>
            <div class="item-details">
            <div class="item-details-left">
            <img src="  ${mealDetails.meals[0].strMealThumb}" alt="">
        </div>
        <div class="item-details-right">
            <div class="item-name">
                <strong>Name: </strong>
                <span class="item-text">
                ${mealDetails.meals[0].strMeal}
                </span>
             </div>
            <div class="item-category">
                <strong>Category: </strong>
                <span class="item-text">
                ${mealDetails.meals[0].strCategory}
                </span>
            </div>
            <div class="item-ingrident">
                <strong>Ingrident: </strong>
                <span class="item-text">
                ${mealDetails.meals[0].strIngredient1},${mealDetails.meals[0].strIngredient2},
                ${mealDetails.meals[0].strIngredient3},${mealDetails.meals[0].strIngredient4}
                </span>
            </div>
            <div class="item-instruction">
                <strong>Instructions: </strong>
                <span class="item-text">
                ${mealDetails.meals[0].strInstructions}
                </span>
            </div>
            <div class="item-video">
                <strong>Video Link:</strong>
                <span class="item-text">
                <a href="${mealDetails.meals[0].strYoutube}">Watch Here</a>
              
                </span>
                <div id="like-button" onclick="addRemoveToFavList(${mealDetails.meals[0].idMeal})"> 
                 ${isFav(list, mealDetails.meals[0].idMeal) ? 'Remove From Favourite' : 'Add To Favourite'} </div>
            </div>
        </div>
    </div> 
            <div class="card-name">
            Related Items
        </div>
        <div id="cards-holder" class=" remove-top-margin ">`
        }
        if( mealList.meals!=null){
            html += mealList.meals.map(element => {
                return `       
                <div class="card">
                    <div class="card-top"  onclick="showMealDetails(${element.idMeal}, '${searchInput}')">
                        <div class="dish-photo" >
                            <img src="${element.strMealThumb}" alt="">
                        </div>
                        <div class="dish-name">
                            ${element.strMeal}
                        </div>
                        <div class="dish-details">
                            ${truncate(element.strInstructions, 50)}
                            <span class="button" onclick="showMealDetails(${element.idMeal}, '${searchInput}')">Know More</span>
                        </div>
                    </div>
                    <div class="card-bottom">
                        <div class="like">
                           
                            <i class="fa-solid fa-heart ${isFav(list, element.idMeal) ? 'active' : ''} " 
                            onclick="addRemoveToFavList(${element.idMeal})"></i>
                        </div>
                        <div class="play">
                            <a href="${element.strYoutube}">
                                <i class="fa-brands fa-youtube"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `
            }).join('');
        }
    
      
        html = html + '</div>';
    
        document.getElementById('flex-box').innerHTML = html;
    }
    
    
    
    /**
    This function is used to show all the meals which are added to the favourite list.
    @function
    @async
    @returns {string} html - This returns html which is used to show the favourite meals.
    @throws {Error} If there is no favourite meal then it will show "Nothing To Show....."
    @example
    showFavMealList()
    */
    async function showFavMealList() {
        let favList = JSON.parse(localStorage.getItem(dbObjectFavList));
        let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
        let html = "";
    
        if (favList.length == 0) {
            html = `<div class="fav-item nothing"> <h1> 
            Nothing To Show.....</h1> </div>`
        } else {
            for (let i = 0; i < favList.length; i++) {
                const favMealList = await fetchMealsFromApi(url, favList[i]);
                if (favMealList.meals[0]) {
                    let element = favMealList.meals[0];
                    html += `
                    <div class="fav-item" onclick="showMealDetails(${element.idMeal},'${generateOneCharString()}')">
                  
                    <div class="fav-item-photo">
                        <img src="${element.strMealThumb}" alt="">
                    </div>
                    <div class="fav-item-details">
                        <div class="fav-item-name">
                            <strong>Name: </strong>
                            <span class="fav-item-text">
                               ${element.strMeal}
                            </span>
                        </div>
                        <div id="fav-like-button" onclick="addRemoveToFavList(${element.idMeal})">
                            Remove
                        </div>
                    </div>
                </div>               
                    `
                }
            }
        }
        document.getElementById('fav').innerHTML = html;
    }
updateTask();    