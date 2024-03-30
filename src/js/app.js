
const selectedFilter = "selected";
const limit = 5;

//To save data about the info that received from the API
const charactersInfoByInput = {};

//To save the url of the API
const urlResources =
    {
        "characters": "https://rickandmortyapi.com/api/character/",
    }

const filtersOptions = 
[
    {
        "filterName" : "status",
        "options" : ["Alive","Dead","Unknown"]
    },{
        "filterName" : "species",
        "options" : ["Human","Humanoid","Alien","Cronenberg","Poopybutthole","Mythological","Unknown"]
    },{
        "filterName" : "gender",
        "options" : ["Male","Female","Genderless","Unknown"]
    }
]

//To save the search filters that the user selected    
const currentFilters = {};                     
let contentDom = null;
let pastConditional = false;
let consultNext = false;
let arraySearching;
let total;
let inputValue = "";
let range = 1;
let limitCurrent = limit;
let urlCurrent = urlResources.characters;


document.addEventListener("DOMContentLoaded",function(){

 
    getTotalCharacters();
    changeArray(true);
       
});

//Get info from the API after display in the DOM
function getDataAndDisplay(newArray, displayComponents = false){

    let urlQuery = urlCurrent + newArray;
    new Promise(resolve => {
        
        resolve(consumeApi(urlQuery));

    }).then(result => {
        showData(result);
        if(displayComponents) addButtons();
    })
      .catch();

}

//Event listeners
function eventListeners(){


    //Clear filters search  
    const cleaner = document.querySelector("#clear-filters");
    cleaner.addEventListener("click",clearFilters);

    //Show filters in mobile design
    const filters = document.querySelector(".mobile-filters");
    filters.addEventListener("click",showFiltersMobile);

    //Close filters in mobile design
    const close = document.querySelector(".filter-close-mobile-menu");
    close.addEventListener("click",closeFilterMobile);


    //Input searching
    const input = document.querySelector("#input-search");
    input.onkeyup = function(e){
        getInput(e);
    }

    //Previous button
    const previousButton = document.querySelector("#previous");
    previousButton.addEventListener("click",decRangeArray);


    //Next button
    const nextButton = document.querySelector("#next");
    nextButton.addEventListener("click",incRangeArray);

    const optionsFilters = document.querySelectorAll(".option");
    optionsFilters.forEach(option =>{
        option.onclick = function(e){
            addFilter(e);
        }
    });
 
}

//Get total characters that has saved the API and add info in the footer of the DOM
function getTotalCharacters(){

    const infoCharacters = new Array;

    new Promise(resolve => {
        
        resolve(consumeApi(urlResources.characters));

    }).then(result => {

        infoCharacters.push(result);
        total = infoCharacters.map(property => property.info.count).toString();
        
        const totalCharactersFooter = document.createElement("P");
        totalCharactersFooter.innerHTML = `<span>all characters are: </span> ${total}`;

        const yearFooter = document.createElement("P");
        yearFooter.textContent = `All rights reserved ${new Date().getFullYear()} ©`;

        document.querySelector(".info-footer").appendChild(totalCharactersFooter);
        document.querySelector(".footer").appendChild(yearFooter);
        urlResources.totalCharacters = parseInt(total);

    })
      .catch();


}

//Add buttons to the DOM
function addButtons(){

    const previousButton= document.createElement("BUTTON");
    previousButton.type = "button";
    previousButton.classList.add("blue-buttom-block","hidden");
    previousButton.id = "previous";
    previousButton.textContent = "previous";

    const nextButton= document.createElement("BUTTON");
    nextButton.type = "button";
    nextButton.classList.add("blue-buttom-block");
    nextButton.id = "next";
    nextButton.textContent = "next";

    const buttonsContainer= document.createElement("DIV");
    buttonsContainer.classList.add("buttons-container");
    buttonsContainer.appendChild(previousButton);
    buttonsContainer.appendChild(nextButton);

    //Add buttons to DOM    
    document.querySelector(".results-container").appendChild(buttonsContainer);


    addFiltersToDom();
    
}

//Scripting of the filters of the DOM
function addFiltersToDom(){

    filtersOptions.forEach(filter => {

        const filterContainer = document.createElement("DIV");
        filterContainer.classList.add("filter","filter-search");

        const filterName = document.createElement("P");
        filterName.classList.add("filter-title");
        filterName.textContent = filter.filterName;

        const optionsFilterContainer = document.createElement("UL");
        optionsFilterContainer.classList.add("filter-search-options");

        filter.options.forEach(option => {

            const optionName = document.createElement("LI");
            optionName.classList.add("option");
            optionName.setAttribute("data-parameter",filter.filterName);
            optionName.textContent = option;

            optionsFilterContainer.appendChild(optionName);


        });

        filterContainer.appendChild(filterName);
        filterContainer.appendChild(optionsFilterContainer);

        document.querySelector(".filters-container").appendChild(filterContainer);

    });

    eventListeners();
}


//To show the 5 next characters in the DOM
function incRangeArray(){

    if(!pastConditional ||  charactersInfoByInput.countCharacters > limit){

        range+=limitCurrent;

        if(document.querySelector("#previous").classList.contains("hidden")){
            document.querySelector("#previous").classList.remove("hidden");
        }

        changeArray(false);

        if(urlResources.totalCharacters-(range+limit) < 0){
            document.querySelector("#next").classList.add("hidden");
        }

    }

}

//To show the 5 previous characters in the DOM
function decRangeArray(){

    if(pastConditional) pastConditional=false;

    //Return to previous 5 characters if they existed
    if(range + limit > urlResources.totalCharacters && charactersInfoByInput.countCharacters>limit){ 
        limitCurrent = 5;
        document.querySelector("#next").classList.remove("hidden");
    }   
    

    range = (range-limitCurrent < 1 && Object.keys(charactersInfoByInput).length === 0) 
            ? 1 : range-=limitCurrent;
    
    changeArray(false);

    if(range === 1 || (range === 0 && charactersInfoByInput.currentPage === 1)) document.querySelector("#previous").classList.add("hidden");
    
}

//To show 5 characters in the DOM 
function changeArray(value){

    if(Object.keys(charactersInfoByInput).length !== 0){

        if(range+limit > urlResources.totalCharacters && charactersInfoByInput.currentPage !== charactersInfoByInput.pages){
            charactersInfoByInput.currentPage++;
            const urlParameters = changeFilterSearching(charactersInfoByInput.currentPage,"page");
            urlCurrent = `${urlResources.characters}${urlParameters}`;
            range = 0;

            new Promise(resolve => {

                resolve(consumeApi(urlCurrent));
    
            }).then(result => {

                charactersInfoByInput.characters = result.results;
                urlResources.totalCharacters = result.results.length;
                if(urlResources.totalCharacters-(range+limit) <= 0) document.querySelector("#next").classList.add("hidden");
                
                showData(charactersInfoByInput.characters.slice(range,(range+limit)));
                
            }).catch();

        }else if(range<0 && charactersInfoByInput.currentPage !== 1){
            charactersInfoByInput.currentPage--;
            const urlParameters = changeFilterSearching(charactersInfoByInput.currentPage,"page");
            urlCurrent = `${urlResources.characters}${urlParameters}`;

            new Promise(resolve => {

                resolve(consumeApi(urlCurrent));
    
            }).then(result => {

                charactersInfoByInput.characters = result.results;
                urlResources.totalCharacters = result.results.length;

                range = urlResources.totalCharacters-limit;

                showData(charactersInfoByInput.characters.slice(range,(range+limit)));
                
            }).catch();

        }else{
            if(range>=0){
                let sliceLimit = range + limit;
                if(range + limit >= urlResources.totalCharacters){
                    sliceLimit = urlResources.totalCharacters;
                    pastConditional = true;
                }    
                showData(charactersInfoByInput.characters.slice(range,sliceLimit));
            }
        }

    }else{
        if(range + limit > urlResources.totalCharacters){   
            limitCurrent = (urlResources.totalCharacters - range) + 1;
            pastConditional = true;
        }

        arraySearching = Array.from({length: limitCurrent}, (_, i) => i + range);


        getDataAndDisplay(arraySearching, value);
    }

}


//Add a new filter to search
function addFilter(evt){

    const options = Array.from(evt.target.parentElement.childNodes);
    
    options.forEach(option => {

        if(option === evt.target && !option.classList.contains(selectedFilter)){
            evt.target.classList.add(selectedFilter);
        }else if(option.classList.contains(selectedFilter)){
            option.classList.remove(selectedFilter);
        }

    });
    
    const urlParameters = changeFilterSearching(evt.target.textContent,evt.target.getAttribute("data-parameter"));
    urlCurrent = `${urlResources.characters}${urlParameters}`;

    if(!consultNext) searchData();

}


//To clear filters search in the currentFilters object
function clearFilters(){

    let filters = Array.from(document.querySelectorAll(".option"));

    filters.forEach(filter => {

        if(filter.classList.contains(selectedFilter)) filter.classList.remove(selectedFilter);

    });


    Object.keys(currentFilters).forEach(element => {
        if(element !== "name") delete currentFilters[element];
    });

    if(Object.keys(currentFilters).length !== 0) currentFilters[Object.keys(currentFilters)[0]].characterQuery = "?";


    const urlParameters = getUrlParameters();
    urlCurrent = `${urlResources.characters}${urlParameters}`;
    
    if(!consultNext) searchData();

}

//To show the mobile filters menu
function showFiltersMobile(){

   //Save the current content 
   contentDom = document.querySelector(".relative").cloneNode(true);
   
   //Get filters from content
   const filters = Array.from(document.querySelector(".filters").childNodes);

   //Clean the current content
   const relativeContainer = document.querySelector(".relative");
   while(relativeContainer.firstChild){
        relativeContainer.removeChild(relativeContainer.firstChild);
    }

   //Add filters to content
   const filtersSection = document.createElement("SECTION");
   filtersSection.classList.add("filters","static");

   filters.forEach(filter => filtersSection.appendChild(filter));

   relativeContainer.appendChild(filtersSection);

   consultNext = true;

}

//Close the mobile filters menu
function closeFilterMobile(){

    const domElements =  Array.from(contentDom.childNodes);

    //Save the current settings filters
    const currentFilters = document.querySelector(".filters-container").cloneNode(true);

    //Remove filters content
    const relativeContainer = document.querySelector(".relative");
    while(relativeContainer.firstChild){
        relativeContainer.removeChild(relativeContainer.firstChild);
    }

   //Return original content
   domElements.forEach(element => relativeContainer.appendChild(element));


   //Set the current settings filters in the new filter-container (div)
   document.querySelector(".filters-container").innerHTML = currentFilters.innerHTML;

   //Remove class static to hidden filters with position absolute
   const filters = document.querySelector(".filters");
   filters.classList.remove("static");

   if(consultNext){
        searchData();
        consultNext = false;
   }

   //Set event listeners to some HTML elements
   eventListeners();

}


//To add a filter to the currentFilters object to join to the search url to consult in the API
function changeFilterSearching(filter,parameter){

    const characterQuery = (Object.keys(currentFilters).length === 0) ? "?" : "&";

    if(!currentFilters[parameter] && filter.length !== 0){
        currentFilters[parameter] = {
            "characterQuery" : characterQuery,
            "value" : filter
        }

    }else{
        if(currentFilters[parameter].value === filter || filter.length === 0){
            delete currentFilters[parameter];
            if(Object.keys(currentFilters).length !== 0) currentFilters[Object.keys(currentFilters)[0]].characterQuery = "?";
        }else{
            currentFilters[parameter].value = filter;  
        }
            
    }

    if(parameter !== "page" && currentFilters["page"]) delete currentFilters["page"]; 

    
    return getUrlParameters();

}

//to create a string with the search parameters to join with the search url
function getUrlParameters(){

    let queryUrlParameters = "";
    for (const [key, value] of Object.entries(currentFilters)) {
        queryUrlParameters += `${value.characterQuery}${key}=${value.value}`;
    }

    return queryUrlParameters;

}


//Get value from the searcher input
function getInput(evt){

    inputValue = evt.target.value;
    const urlParameters = changeFilterSearching(inputValue,"name");
    urlCurrent = `${urlResources.characters}${urlParameters}`;

    searchData(); 

}

//To create a message with the filters taht did not searcher results
function searchFilterWithoutResults(){

    let i = 1;
    let filtersArrayLen = Object.keys(currentFilters).length;
    let filters = (currentFilters["name"] && filtersArrayLen > i) ? " and filters " : "";
    
    for (const [key, value] of Object.entries(currentFilters)) {
        if(key !== "name"){
            filters += `${key}:<span> "${value.value}" </span>`;
            if(i<filtersArrayLen) filters += " and ";
        }
        ++i;
    }

    return filters;

}


//Search input value in the API
function searchData(){

    //When the input value is not a empty string
    if(inputValue.length !== 0 || Object.keys(currentFilters).length !== 0){
        new Promise(resolve => {
            
            resolve(consumeApi(urlCurrent));

        }).then(result => {

            if(result.hasOwnProperty("error")){

                const resultsContainer = document.querySelector(".characters-container");

                //Clear the result container content 
                while(resultsContainer.firstChild){
                    resultsContainer.removeChild(resultsContainer.firstChild);
                }

                const message = document.createElement("H3");
                message.classList.add("message");
                const filtersFailed = searchFilterWithoutResults();
                message.innerHTML = `Not results for the entrance: <span>"${inputValue}"</span>${filtersFailed}`;

                document.querySelector("#previous").classList.add("hidden");
                document.querySelector("#next").classList.add("hidden");

                resultsContainer.appendChild(message);

                return;
            }

            charactersInfoByInput.pages = result.info.pages;
            charactersInfoByInput.countCharacters = result.info.count;
            charactersInfoByInput.characters = result.results;
            charactersInfoByInput.currentPage = 1;
            urlResources.totalCharacters = result.results.length;

            range = 0;
            limitCurrent = 5;
            if(pastConditional) pastConditional=false;
            if(!document.querySelector("#previous").classList.contains("hidden")){
                document.querySelector("#previous").classList.add("hidden");
            }

            //Remove next buttom if we have more than 5 characters
            if(charactersInfoByInput.countCharacters <= limit) document.querySelector("#next").classList.add("hidden");


            showData(charactersInfoByInput.characters.slice(range,range+limit));


        }).catch();

    }else{ //When the input value is a empty string
        urlCurrent = urlResources.characters;
        Object.keys(charactersInfoByInput).forEach(key => delete charactersInfoByInput[key]);
        range = 1;
        urlResources.totalCharacters = total;
        if(!document.querySelector("#previous").classList.contains("hidden")){
            document.querySelector("#previous").classList.add("hidden");
        }
        changeArray(false); 
    }

}


//Get data from The Rick and Morty API
async function consumeApi(url){
   try {

        const result = await fetch(url);
        const data = await result.json(); //Convert to JSON the answer

        //return obtained data
        return data;
    
   } catch (error) {
   }

}

//To create HTML elements after add to DOM
function showData(charactersList){


    const resultsContainer = document.querySelector(".characters-container");
    let characters = charactersList;

    //Clear the result container content 
    while(resultsContainer.firstChild){
        resultsContainer.removeChild(resultsContainer.firstChild);
    }

    if (!Array.isArray(characters)) characters = [charactersList];

    characters.forEach(character =>{

        //Select data from results
        const image = character.image;
        const featuresDataCharacter = [
            {
                "type" : "features",
                "data" : {
                    "name" : character.name,
                    "status" : character.status,
                    "specie" : character.species
                }
            },{
                "type" : "additionals",
                "data" : [{
                    "title" : "Last known location",
                    "info" : character.location.name,
                    "consumeApi" : false
                },{
                    "title" : "First seen in",
                    "info" : character.episode[0],
                    "consumeApi" : true
                }]
            }];

        //Scripting to show character

        //Image
        const dataImage = document.createElement("IMG");
        dataImage.classList.add("h-100-cover");
        dataImage.setAttribute("src",image);
        dataImage.setAttribute("alt","Character");

        const imageDiv = document.createElement("DIV");
        imageDiv.classList.add("image-result-container");
        imageDiv.appendChild(dataImage);

        //Features
        const features = createFeatures(featuresDataCharacter);    

        //image an features container     
        const characterContainer = document.createElement("DIV");
        characterContainer.classList.add("result");
        characterContainer.appendChild(imageDiv);
        characterContainer.appendChild(features);

        //Add to DOM    
        resultsContainer.appendChild(characterContainer);
        resultsContainer.scrollTop;

        //Add next buttom if was removed previously because we had at least 5 characters
        if(urlResources.totalCharacters > limit &&  document.querySelector("#next") !== null){
            document.querySelector("#next").classList.remove("hidden");
        }
        
    });

}

//Create HTML element of the features
function createFeatures(dataCharacter){

    const featuresContainer = document.createElement("DIV");
    featuresContainer.classList.add("features-result-container");
    
    dataCharacter.forEach(character => {

        if(character.type === "features"){

            let featureDiv = document.createElement("DIV");
            featureDiv.classList.add("result-info");

            const nameCharacter = document.createElement("H3");
            nameCharacter.textContent = character.data.name;

            const statusCharacter = document.createElement("P");
            statusCharacter.classList.add("info");
            statusCharacter.innerHTML = `<span>Status: </span> ${character.data.status}`;

            const specieCharacter = document.createElement("P");
            specieCharacter.classList.add("info");
            specieCharacter.innerHTML = `<span>Specie: </span> ${character.data.specie}`;

            featureDiv.appendChild(nameCharacter);
            featureDiv.appendChild(statusCharacter);
            featureDiv.appendChild(specieCharacter);

            featuresContainer.appendChild(featureDiv);

        }else{

            character.data.forEach(additionalInfo => {

                const element = createAdditionalFeatures(additionalInfo);

                featuresContainer.appendChild(element);
                
            });

        }

    });


    return featuresContainer;

}


//To create a HTML element of the additionals features
function createAdditionalFeatures(data) {

    const featureDiv = document.createElement("DIV");
    featureDiv.classList.add("result-info");
                
    const additionalInfoTitle = document.createElement("P");
    additionalInfoTitle.classList.add("text-gray");
    additionalInfoTitle.textContent = data.title;

    const additionalInfoValue = document.createElement("P");
    additionalInfoValue.classList.add("info");

    if(data.consumeApi){

        new Promise(resolve => {
        
            resolve(consumeApi(data.info));
    
        }).then(result => {
            return getNameEpisodeCharacter(result);
        }).then(nameEpisode => {
            additionalInfoValue.textContent = nameEpisode;
        })
          .catch();  

    }else{
        additionalInfoValue.textContent = data.info;
    }

    
    featureDiv.appendChild(additionalInfoTitle);
    featureDiv.appendChild(additionalInfoValue);

    return featureDiv;

}


//Get the episode name where the character had his debut
function getNameEpisodeCharacter(episode){

    const infoEpisode = new Array;
    infoEpisode.push(episode);

    return infoEpisode.map(info => info.name).toString();

}
