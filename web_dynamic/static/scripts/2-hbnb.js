const amenities = {};
// Block of code runs after the HTML document has been fully loaded.
$(document).ready(function () {
  // Handle the filters (Amenities) section interaction
  $('input[type="checkbox"]').change(function () {
    if ($(this).is(':checked')) {
      addItem($(this));
    } else {
      removeItem($(this));
    }
  });
});

// Add Amenity to amenities dictionary
function addItem (checkbox) {
  const dataId = checkbox.attr('data-id');
  const dataName = checkbox.attr('data-name');
  amenities[dataId] = dataName;

  displayFilters();
}

// Remove Amenity from amenities dictionary
function removeItem (checkbox) {
  const id = checkbox.attr('data-id');
  delete amenities[id];

  displayFilters();
}

// Display the list of amenities in the filter section
function displayFilters () {
  const amenitiesNames = Object.values(amenities);
  if (amenitiesNames.length !== 0) {
    $('.amenities h4').text(amenitiesNames.join(', '));
  } else {
    $('.amenities h4').html('&nbsp;');
  }
}

// Check HBNB API status
$.get('http://0.0.0.0:5001/api/v1/status/', function (response) {
  if (response.status === 'OK') {
    $('div#api_status').addClass('available');
  } else {
    $('div#api_status').removeClass('available');
  }
});
