const mybtn = document.getElementById('myList');   // Получаем кнопку "Список"
const tre = document.getElementById('btn');   // Получаем кнопку "Открыть меню"
tre.addEventListener("click", openmenu);      // Добавляем слушатель события клика на кнопку "Открыть меню"

function openmenu() {                         // Функция для открытия или закрытия меню
    if (mybtn.style.display != 'block') {     // Проверяем, отображается ли уже список
        mybtn.style.display = 'block';        // Если нет, то отображаем список
    } else {
        mybtn.style.display = 'none';         // Иначе скрываем список
    }
    console.log('clicked');                   // Выводим в консоль сообщение о клике
}

// Map settings
const attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
let map = L.map('map1').setView([51.505, -0.09], 2);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution }).addTo(map);
let markersLayer = new L.LayerGroup();        // Слой для всех маркеров
map.addLayer(markersLayer);

// Функция для отображения всех пивоварен на карте
async function show_all_breweries() {
    const allBreweriesUrl = `https://api.openbrewerydb.org/breweries`;  // URL для получения всех пивоварен

    try {
        let response = await fetch(allBreweriesUrl);  // Получаем все пивоварни
        let data = await response.json(); // Преобразуем информацию о пивоварнях в JSON

        // Добавляем маркеры для каждой пивоварни
        data.forEach(brewery => {
            if (brewery.latitude && brewery.longitude) {
                let marker = L.marker([brewery.latitude, brewery.longitude]).addTo(map);
                marker.bindPopup(`<b>${brewery.name}</b><br>${brewery.street}<br>${brewery.city}, ${brewery.state}`).openPopup();
                markersLayer.addLayer(marker);
            }
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data. Please try again later.");
    }
}

// Вызываем функцию для отображения всех пивоварен на карте
show_all_breweries();

// Функция для поиска и отображения пивоварен
async function show_me() {
    let place = document.getElementById("searchbar").value.trim(); // Получаем местоположение из строки поиска и убираем лишние пробелы
    if (!place) {
        alert("Please enter a location");
        return;
    }

    const api_url = `https://nominatim.openstreetmap.org/search?format=json&q=${place}`; // Получаем информацию о местоположении с OpenStreetMap
    const db_url = `https://api.openbrewerydb.org/breweries/search?query=${place}&per_page=50`; // Получаем информацию о пивоварнях с OpenBreweryDB

    try {
        let response = await fetch(api_url);    // Получаем информацию о местоположении
        let db_response = await fetch(db_url);  // Получаем информацию о пивоварнях
        let data = await response.json();       // Преобразуем информацию о местоположении в JSON
        let db_data = await db_response.json(); // Преобразуем информацию о пивоварнях в JSON

        console.log(data);
        console.log(db_data);

        updateSidebar(db_data);                 // Обновляем боковую панель с информацией о пивоварнях

        if (db_data.length > 0) {
            markersLayer.clearLayers();        // Очищаем существующие маркеры

            // Добавляем маркеры для каждой пивоварни из результатов поиска
            db_data.forEach(e => {
                if (e.latitude && e.longitude) {
                    let marker = L.marker([e.latitude, e.longitude]).addTo(map);
                    marker.bindPopup(`<b>${e.name}</b><br>${e.street}<br>${e.city}, ${e.state}`).openPopup();
                    markersLayer.addLayer(marker);
                }
            });

            if (data.length > 0) {
                let zoomLevel = 10; // Установите стандартный уровень зума
                if (data[0].type === "city") {
                    zoomLevel = 12; // Более детальный зум для города
                } else if (data[0].type === "state") {
                    zoomLevel = 8; // Менее детальный зум для штата
                }
                map.setView([data[0].lat, data[0].lon], zoomLevel); // Центрируем карту на первом результате поиска
            } else {
                alert("Location not found");
            }
        } else {
            alert("No breweries found for this location");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data. Please try again later.");
    }
}

// Обновляем боковую панель с информацией о пивоварнях
function updateSidebar(breweries) {
    const infoList = document.getElementById('info_list');
    infoList.innerHTML = ''; // Очищаем предыдущие элементы списка

    // Добавляем элементы списка для каждой пивоварни
    breweries.forEach(brewery => {
        const listItem = document.createElement('li');
        listItem.textContent = `${brewery.name}, ${brewery.city}, ${brewery.state}`;
        infoList.appendChild(listItem);
    });
}

// Добавляем слушатель события клавиатуры для строки поиска
document.getElementById('searchbar').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        show_me();
    }
});






