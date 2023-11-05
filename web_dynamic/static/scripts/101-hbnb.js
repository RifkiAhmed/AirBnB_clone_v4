const amenities = {};
const states = {};
const cities = {};
// Block of code runs after the HTML document has been fully loaded.
$(document).ready(function () {
  // Handle the filters (States, Cities and Amenities) section interaction
  $('input[type="checkbox"]').change(function () {
    if ($(this).is(':checked')) {
      addItem($(this));
    } else {
      removeItem($(this));
    }
  });
  // Search button click
  $('button').click(function () {
    placesSearch();
  });

  // Toggle reviews list
  $('.places').on('click', '.toggleReviews', function () {
    const placeId = $(this).closest('[place-id]').attr('place-id');
    if ($(this).text() === 'Hide') {
      $(this).text('Show');
      $('#' + placeId).empty();
    } else {
      $(this).text('Hide');
      showReviews(placeId);
    }
  });
});

// Check HBNB API status and display the list of places
$.get('http://0.0.0.0:5001/api/v1/status/', function (response) {
  if (response.status === 'OK') {
    $('div#api_status').addClass('available');
    placesSearch();
  } else {
    $('div#api_status').removeClass('available');
  }
});

// Add location (State +/- City) or Amenity to the corresponding dictionary
function addItem (checkbox) {
  const dataId = checkbox.attr('data-id');
  const dataName = checkbox.attr('data-name');
  if (checkbox.attr('class') === 'amenity') {
    amenities[dataId] = dataName;
  } else if (checkbox.attr('class') === 'state') {
    states[dataId] = dataName;
  } else {
    cities[dataId] = dataName;
  }
  displayFilters();
}

// Remove location (State +/- City) or Amenity from the corresponding dictionary
function removeItem (checkbox) {
  const id = checkbox.attr('data-id');
  if (checkbox.attr('class') === 'amenity') {
    delete amenities[id];
  } else if (checkbox.attr('class') === 'state') {
    delete states[id];
  } else {
    delete cities[id];
  }
  displayFilters();
}

// Display the list of locations and amenities in the filter section
function displayFilters () {
  const amenitiesNames = Object.values(amenities);
  if (amenitiesNames.length !== 0) {
    $('.amenities h4').text(amenitiesNames.join(', '));
  } else {
    $('.amenities h4').html('&nbsp;');
  }
  const locationsNames = Object.values(states).concat(Object.values(cities));
  if (locationsNames.length !== 0) {
    $('.locations h4').text(locationsNames.join(', '));
  } else {
    $('.locations h4').html('&nbsp;');
  }
}

// Search for places
function placesSearch () {
  $('.places').empty();
  $.ajax({
    type: 'POST',
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    contentType: 'application/json',
    data: JSON.stringify({ amenities: Object.keys(amenities), states: Object.keys(states), cities: Object.keys(cities) }),
    success: function (response) {
      response.forEach(function (place) {
        // Create <article> element for place
        const placeArticle = $('<article place-id=' + place.id + '>');
        // Create <div> element for place title and price by night
        const placeTitle = $('<div class="title_box">');
        placeTitle.append('<h2>' + place.name + '</h2>');
        placeTitle.append('<div class="price_by_night">' + place.price_by_night + '</div>');
        placeArticle.append(placeTitle);
        // Create <div> element for place informations
        const placeInfo = $('<div class="information">');
        placeInfo.append('<div class="max_guest">' + place.max_guest + ' Guests</div>');
        placeInfo.append('<div class="number_rooms">' + place.number_rooms + ' Bedrooms</div>');
        placeInfo.append('<div class="number_bathrooms">' + place.number_bathrooms + ' Bathrooms</div>');
        placeArticle.append(placeInfo);
        // Create <div> for place Owner
        const placeOwner = $('<div class="owner">');
        placeOwner.append('<h3> Owner: </h3>');
        placeArticle.append(placeOwner);
        // Create <div> element for place description
        placeArticle.append('<div class="description">' + place.description + '</div>');
        // Create <div> element for reviews header
        const reviews = $('<div class="reviews">');
        const reviewsNumber = $('<h3>');
        const reviewsToggle = $('<span class="toggleReviews"> Show </span>');
        reviews.append(reviewsNumber);
        reviews.append(reviewsToggle);
        placeArticle.append(reviews);
        // Create <div> element for reviews list
        const reviewsList = $('<div id=' + place.id + '>');
        placeArticle.append(reviewsList);

        $.get('http://0.0.0.0:5001/api/v1/users/' + place.user_id, function (response) {
          const parag = $('<p>' + response.first_name + ' ' + response.last_name + '</p>');
          placeOwner.append(parag);
        });

        $.get('http://0.0.0.0:5001/api/v1/places/' + place.id + '/reviews', function (data) {
          reviewsNumber.text(data.length + ' Reviews');
        });
        // Append <article> place to <div> places
        $('.places').append(placeArticle);
      });
    }
  });
}

// Display the list of reviews related to the place with Id passed a argument
function showReviews (placeId) {
  const unorderList = $('<ul class="reviews">');
  $.get('http://0.0.0.0:5001/api/v1/places/' + placeId + '/reviews', function (response) {
    response.forEach(function (review) {
      const listItem = $('<li>');
      $.get('http://0.0.0.0:5001/api/v1/users/' + review.user_id, function (response) {
        const date = formatDate(response.created_at);
        listItem.append('<h3> From ' + response.first_name + ' ' + response.last_name + ' the ' + date + '</h3>');
        listItem.append('<p>' + review.text + '<p>');
        unorderList.append(listItem);
      });
    });
  });
  $('#' + placeId).append(unorderList);
}

// Format date of review
function formatDate (datetimeString) {
  const date = new Date(datetimeString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  if (day >= 11 && day <= 13) {
    return day + 'th ' + month + ' ' + year;
  }
  switch (day % 10) {
    case 1:
      return day + 'st ' + month + ' ' + year;
    case 2:
      return day + 'nd ' + month + ' ' + year;
    case 3:
      return day + 'rd ' + month + ' ' + year;
    default:
      return day + 'th ' + month + ' ' + year;
  }
}
