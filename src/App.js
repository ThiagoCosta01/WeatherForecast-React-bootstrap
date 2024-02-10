import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsSearch } from "react-icons/bs";
//Objeto com dados da API
const api = {
  key: '6b0f472b0043337bd1cfd27da6efafc3',
  base: 'https://api.openweathermap.org/data/2.5/',
};

const App = () => {
  //elementos react-useState
  const [search, setSearch] = useState('');
  const [hideLoader, setHideLoader] = useState('spinner-border');
  const [weather, setWeather] = useState({});
  const [userLocation, setUserLocation] = useState({});
  const [cityNotFoundSpan, setCityNotFoundSpan] = useState('');

  //constrói url da cidade buscada
  const urlApiSearchCity = `${api.base}weather?q=${search}&units=metric&APPID=${api.key}&lang=pt_br`;
  //constrói url para gerar ícone da condição climática
  const urlImgUser = userLocation.weather ? `http://openweathermap.org/img/wn/${userLocation.weather[0].icon}.png` : '';
  const urlImgWeather = weather.weather ? `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png` : '';

  //pega a localização do usuário quando a página renderizar
  useEffect(() => {
    getUserLocation();
  }, []);

  //função que realiza requisição HTTP da api passada e retorna os dados em json
  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      //caso dê erro na requisição, lança o status da resposta
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro de requisição:', error);
    }
  };

  const getUserLocation = async () => {
    //verifica o acesso à geolocalização
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          //usa a função de captura de localização e retorna algum callback (sucesso/erro)
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        //passa as coordenadas para as constantes
        const { latitude, longitude } = position.coords;
        //constrói url da API usando coordenadas
        const urlUser = `${api.base}weather?lat=${latitude}&lon=${longitude}&appid=${api.key}&lang=pt_br`;
        //faz a requisição à API, esconde a animação de carregamento bootstrap e povoa objeto com os dados 
        const results = await fetchData(urlUser);
        setHideLoader('');
        setUserLocation(results);

      } catch (error) {
        console.error('Erro na requisição:', error);
      }
    }
  };

  //roda quando botão de busca for pressionado
  const searchPressed = async () => {
    try {
      //requisição da cidade procurada
      const res = await fetch(urlApiSearchCity);
      //caso a cidade não seja encontrada, limpa o objeto weather e informa erro 404
      if (!res.ok) {
        if (res.status === 404) {
          setCityNotFoundSpan('Cidade não encontrada!');
          setWeather({});

        }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      //transforma a promise em json e povoa objeto
      const result = await res.json();

      setCityNotFoundSpan('');
      setWeather(result);
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  //interface da aplicação
  return (
    <div className="App">
      <header className="App-header">

        <div className="Container">
          {/* Título */}
          <h1 className="custom-h1" id='title'>Clima - RMC</h1>
          {/* Localização Atual do Usuário:  */}
          <div className="UserLocation">
            {/* Animação de carregamento */}
            <div className={hideLoader} role="status">
              <span className="sr-only"></span>
            </div>
            <h3>Localização atual: </h3>
            {/* Temperatura */}
            <p>{userLocation.main && `${(userLocation.main.temp - 273.15).toFixed(1)}°`}</p>

            <div className='d-flex  justify-content-center' id='cityWeatherDetails'>
              {/* Nome da Cidade */}
              <p>{userLocation.name}</p>

              <div id='verticalLine' ></div>
              {/* Condição Climática */}
              <p id='descWeather'>{userLocation.weather && userLocation.weather[0].description}</p>
              {/* Ícone da Condição Climática */}
              <img src={urlImgUser} alt="" id="weather-icon" />
            </div>
          </div>

          <hr className="my-4" />

          {/* Localização Buscada */}
          <div className="Search">
            <h2>Pesquisar</h2>
            <div className='form-group d-flex align-items-center' id='searchInputsGroup'>
              {/* Caixa de Buscas */}
              <input
                className='form-control'
                id='searchInput'
                type="text"
                placeholder="Cidade"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {/* Botão de Busca */}
              <button className='btn btn-secondary' onClick={searchPressed}> <BsSearch /></button>
            </div>
            <span>{cityNotFoundSpan}</span>
            {weather.main && (
              <div id="detailsLocation">
                {/* Bandeira do país */}
                <img src={`https://flagsapi.com/${weather.sys.country}/flat/64.png`} />
                {/* Temperatura */}
                <p>{(weather.main.temp).toFixed(1)}°</p>
                {/* Nome da Cidade */}
                <p id='cityNameWeather'>{weather.name}</p>
                <div className='d-flex align-items-center justify-content-center ' id='descWeather'>
                  {/* Condição Climática */}
                  <p>{weather.weather[0].description}</p>
                  {/* Ícone da Condição Climática */}
                  <img src={urlImgWeather} alt="Condições Climáticas" id="weather-icon" />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Modo Noturno (função ainda incompleta) */}
        <label htmlFor="switch" id='switchLabel'>
          Modo Noturno
          <input type="checkbox" id="switch" defaultChecked />
        </label>

      </header>
    </div>
  );
}

export default App;
