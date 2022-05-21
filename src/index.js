import './css/styles.css';

import debounce from 'lodash.debounce';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchCountries } from './fetchCountries';

const DEBOUNCE_DELAY = 300;

const refs = {
  input: document.getElementById('search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

refs.input.addEventListener('input', debounce(onInputChange, DEBOUNCE_DELAY));

function onInputChange(event) {
  const inputValue = event.target.value.trim();

  if (!inputValue.length) {
    clearMarkup();
    showMessageOneSymbol();

    return;
  }

  const fetchResponse = fetchCountries(inputValue);
  fetchHandler(fetchResponse);
}

function fetchHandler(fetchResponse) {
  fetchResponse
    .then(data => {
      clearMarkup();

      if (data.length > 10) {
        showMessageManyMatches();
        return;
      } else if (data.length > 1 && data.length <= 10) {
        createMarkupCountryList(data);
      } else {
        createMarkupCountryInfo(data);
      }
    })
    .catch(() => {
      clearMarkup();
      showMessageNoCountries();
    });
}

function createMarkupCountryList(data) {
  clearMarkup();

  const markup = data
    .map(
      ({ name, flags }) => ` <li class="list-item">
        <div><img src="${flags.svg}" alt="flag"></div>
        <p>${name.official}</p>
      </li>`,
    )
    .join('');
  refs.countryList.innerHTML = markup;
}

function clearMarkup() {
  refs.countryList.innerHTML = '';
  refs.countryInfo.innerHTML = '';
}

function createMarkupCountryInfo(data) {
  clearMarkup();

  const [{ languages }] = data;

  const lang = Object.values(languages).join(', ');

  const markup = data
    .map(
      ({ name, flags, capital, population }) =>
        `<div>
      <img src="${flags.svg}" alt="flag">
      <p >${name.official}</p>
      </div>
      <p>Capital: ${capital[0]}</p>
      <p>Population: ${population}</p>
      <p>Languages: ${lang}</p>`,
    )
    .join('');

  refs.countryInfo.innerHTML = markup;
}

function showMessageOneSymbol() {
  Notify.warning('Please enter at least one letter', {
    width: '280px',
    position: 'center-top',
    distance: '10px',
    timeout: 1500,
  });
}

function showMessageManyMatches() {
  Notify.info('Too many matches found. Please enter a more specific name.', {
    width: '280px',
    position: 'center-top',
    distance: '10px',
    timeout: 1500,
  });
}

function showMessageNoCountries() {
  Notify.failure('Oops, there is no country with that name', {
    width: '280px',
    position: 'center-top',
    distance: '10px',
    timeout: 1500,
  });
}
