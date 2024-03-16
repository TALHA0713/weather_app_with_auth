const submitBtn = document.getElementById("submitBtn");
const cityName = document.getElementById("cityName");
const city = document.getElementById("city_name");
const temp_real = document.getElementById("temp_real");
const temp_status = document.getElementById("temp_status");
const data_hide = document.querySelector(".data_hide");

const day = document.getElementById("day");
const date = document.getElementById("date");


const getInfo = async(event)=>{
    event.preventDefault();
    const cityVal = cityName.value;

    if(cityVal===""){
    city.innerText=`plz write the city name before search`
    data_hide.classList.add('data_hide');
    }
    else{
        try{
            let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&units=metric&appid=27c87fe51c9aeab4ea23a2cd51877824`
            const response = await fetch(url);
            const data = await response.json();
            // const arrData = [data];
            // console.log(arrData);
            // console.log(temp_status);
            city.innerText = `${data.name}, ${data.sys.country}`;
            temp_real.innerText = data.main.temp;
            const temp_mood = data.weather[0].main;

            if (temp_mood === "Clear") {
                temp_status.innerHTML = 
                    '<i class="fas fa-sun" style="color: #eccc68;"></i>';
            }
            else if(temp_mood==="Clouds"){
                temp_status.innerHTML = 
                '<i class="fas fa-cloud" style="color: #f1f2f6;"></i>';
            }
            else if(temp_mood==="Rain"){
                temp_status.innerHTML = 
                '<i class="fas fa-rain" style="color: #a4bobe;"></i>';
            }
            else{
                    temp_status.innerHTML = 
                    '<i class="fas fa-sun" style="color: #eccc68;"></i>';
            }
            data_hide.classList.remove('data_hide');
        }
        catch{
            city.innerText=`plz Enter the city name properly`;
            data_hide.classList.add('data_hide');
        }

        
    }
}

submitBtn.addEventListener("click",getInfo);



const getCurentDay = ()=>{
    let weekday = new Array(7);
    weekday[0] = "Sunday"
    weekday[1] = "Monday"
    weekday[2] = "Tuesday"
    weekday[3] = "Wednesday"
    weekday[4] = "Thurday"
    weekday[5] = "Friday"
    weekday[6] = "Saturday"
    let curentDay =  new Date();
    const days = weekday[curentDay.getDay()];
    day.innerText = days
}
const getCurentDate = () => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    date.innerText = `${day} ${month} ${year}`;
};

getCurentDate();
getCurentDay();