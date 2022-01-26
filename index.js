console.log('hello weather app');
// API Key 9947c552798f0669f535f6df9992ab63

//*************************************
//Global variables (think about tucking them inside code elsewhere ?)
//*************************************
let city ='';
let coordinates = {};
let units = 'metric';
let degree ='ºC';
const bottomContainer = document.querySelector('#bottom');

//*************************************
// SLIDE BAR for changing ºF and ºC (not really a bar. User can click anywhere)
//*************************************
const slide = document.querySelector('#slideBar');
  slide.style.alignItems = 'flex-start';
const c = document.querySelector('#C');
const f = document.querySelector('#F');
  c.style.color = 'lightskyblue'; //setting colors inline seems to make below code work (better way?)
  f.style.color = 'gray';         //   "    "


const unitToggle = document.querySelector('#units');
  unitToggle.addEventListener('click', () => {

    toggleSlideBar();
    changeUnits();
  })



//***********************************
// Search bar (to find city weather info)
//***********************************
const input = document.querySelector('input');
const search = document.querySelector('#searchBtn');
  search.addEventListener('click', () => {

    if (bottomContainer.firstElementChild){clear()};
    city = input.value;
    fetchTemp(city);
    input.value = '';

  })



//********************************
// makes API request for current temp of a given location. Then takes temp and
// city name and returns it in a variable 'currentTemp'. *gets coordinates which are needed to use 'OneCall' in openweather.api. (find a way to use 'onecall' as...one call ? );
//********************************
function fetchTemp(city) {

  let citySearch = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&units='+units+'&appid=9947c552798f0669f535f6df9992ab63';

  let temp = fetch(citySearch, {mode: 'cors'})
  .then(function(response) {
    return response.json();
  })
  .then(function(response) {
    console.log(response); //returned obj from api call
    let temp =response.main.temp.toFixed(1)+degree;
    let feelsLike= response.main.feels_like.toFixed(1)+degree;
    let city = response.name+', '+response.sys.country;
    let weather = response.weather[0].description;
    let high = response.main.temp_max.toFixed(1)+degree;
    let low = response.main.temp_min.toFixed(1)+degree;
    let currentTemp = [city,temp,feelsLike,weather,high,low];


    coordinates = {lat:response.coord.lat,lon:response.coord.lon}; //sends coordinates to global var which is then used on Onecall for forecast.
    fetchForecast(coordinates);
    return currentTemp;
  });

  consumeTemp(temp);

};


//**************************************
// makes API call to get 7 day forecast and bind temp-high/low, weather, and date into a variable.
//**************************************
function fetchForecast(coordinates) {
  let sevenDay =[];
  let apiCall = 'https://api.openweathermap.org/data/2.5/onecall?lat='+coordinates.lat+'&lon='+coordinates.lon+'&units='+units+'&appid=9947c552798f0669f535f6df9992ab63';

  let forecast = fetch(apiCall,{mode:'cors'})
  .then(function(response) {
    return response.json();
  })
  .then(function(response) {
    console.log(response); //returned OBJ from api call
    for(let i=1; i<response.daily.length; i++){

      //day variable converts dt key in returned obj to 'day'
      let day = new Date(response.daily[i].dt * 1000).toLocaleString("en-us", {
        weekday: "long"
      });

      let high = response.daily[i].temp.max.toFixed(1)+degree;
      let low = response.daily[i].temp.min.toFixed(1)+degree;
      let weather = response.daily[i].weather[0].description;
      let dayForecast=[day,high,low,weather];

      sevenDay.push(dayForecast);


    }
    return sevenDay;
  });

  consumeForecast(forecast);
};


//**********************************
// takes result of API call function 'fetchTemp()' and
// displays it to where current temp info is displayed in UI.
//**********************************
function consumeTemp (temp) {
  temp.then(function(response) {

    const callDOM =  maindisplayDOM();
    callDOM.city.textContent = response[0];
    callDOM.temp.textContent = response[1];
    callDOM.feels.textContent = response[2];
    callDOM.weather.textContent =response[3];
    callDOM.high.textContent = "High: "+response[4];
    callDOM.low.textContent = "Low: "+response[5];

    callDOM.feelslikeLabel.textContent ="feels like";
    callDOM.container.classList.add('displayTempBoxShow');
  }).catch(function(response){

    console.log('error in current temp');
  })
};
//********************************
// Targets the Current weather info display box in the DOM and
// returns as object to be used in ConsumeTemp()code
//********************************
function maindisplayDOM () {
  const city = document.querySelector('#currentCity');
  const temp = document.querySelector('#temp');
  const feels = document.querySelector('#feelsLike');
  const weather = document.querySelector('#weather');
  const high = document.querySelector('#high');
  const low = document.querySelector('#low');

  const feelslikeLabel = document.querySelector('#feelsLabel');
  const container = document.querySelector('.displayTempBox');
return {city,temp,feels,weather,high,low,feelslikeLabel,container};
}

//*****************************************
// consumeForecast () takes oneCall API information from fetchForecast() and
// creates HTML elements and populates them with information.
//*****************************************
function consumeForecast (forecast) {
  console.log(forecast); //returns Promise status
  forecast.then(function(response) {
    console.log(response); // returns Array (sevenDay) my code makes once forecast Promise is resolved successfully.
    for(let i=0; i<response.length; i++) {

      const displayBox = document.createElement('div');
      displayBox.classList.add('displayForecastBox');
      bottomContainer.appendChild(displayBox);

      const day = document.createElement('div');
      day.classList.add('label');
      displayBox.appendChild(day);
      day.textContent = response[i][0];

      const high = document.createElement('div');
      high.classList.add('tempDisplay');
      displayBox.appendChild(high);
      high.textContent = response[i][1];

      const low = document.createElement('div');
      low.classList.add('tempDisplay');
      displayBox.appendChild(low);
      low.textContent = response[i][2];


      const weather = document.createElement('div');
      weather.classList.add('medium');
      displayBox.appendChild(weather);
      weather.textContent = response[i][3];

      //*********************************
      //to use weather icon instead of description (change 'description' to 'icon' in fetchForecast())
      //const icon = response[i][3];
      //const image = document.createElement('img');
      //image.src =  "http://openweathermap.org/img/wn/"+icon+"@2x.png";
      //weather.appendChild(image);
      //***********************
    };

  }).catch(function(response) {

    console.log('error in forecast');
  })
};


//**************************************
// clears screen if need be when repopulating with new or alt information.
//**************************************
	function clear() {
		while(bottomContainer.firstElementChild){
			bottomContainer.removeChild(bottomContainer.firstElementChild);
		}
	}
//************************************
// changeUnits () is called to convert API call to metric or farenheiht and then to set the ºC of ºF.
//************************************

function changeUnits() {

  if(units == 'metric') {
    units ='imperial';
    degree= 'ºF';
  }else if (units == 'imperial') {
    units = 'metric';
    degree = 'ºC';
  }
  //this calls api just like original search bar functionality...
    if (bottomContainer.firstElementChild){clear()};
    fetchTemp(city);
};

function toggleSlideBar () {

    slide.style.alignItems =='flex-start' ? slide.style.alignItems ='flex-end' : slide.style.alignItems ='flex-start';


    c.style.color =='lightskyblue' ? c.style.color = 'lightsteelblue' : c.style.color = 'lightskyblue';
    f.style.color =='gray' ? f.style.color = 'lightskyblue' : f.style.color ='gray';


}