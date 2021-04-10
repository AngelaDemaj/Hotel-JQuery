$(document).ready(function () {
    //Find Ids
    const searchField = $("#search-TextField");
    const submitBtn = $("#submit-reset");
    const checkInDate = $("#checkInDate");
    const checkOutDate = $("#checkOutDate");
    const roomsDrop = $("#rooms-DropDown");
    const maxPriceText = $("#maxPrice");
    const priceRange = $("#price-Range");
    const propertyTypeDrop = $("#Property-Type-DropDown");
    const guestRatingDrop = $("#Guest-Rating-DropDown");
    const hotelLocationDrop = $("#Hotel-Location-DropDown");
    const moreFiltersDrop = $("#More-Filters-DropDown");
    const sortByDrop = $("#Sort-By-DropDown");
    const hotelsSection = $("#listing-hotels-section");
    const hotelsAuto = $("#hotelsAuto");

    // Variables for populating Data
    var roomtypes = [];
    var hotels = [];
    var filteredhotels = [];
    var autocompleteNames = [];
    var MaxPrice;
    var PropertyTypes = [];
    var GuestRatings = [];
    var Locations = [];
    var Filters = [];

    // Variables for searching and Sorting
    var cityName;
    var price;
    var propertyType;
    var guestRating;
    var hotelLocation;
    var filters;
    var sortBy;

    $.ajax({
        type: "GET",
        url: "json/data.json",
        dataType: "json"
    }).done((data) => StartApplication(data)).fail((errorObject) => ShowErrorPage(errorObject));

    function StartApplication(data) {
        //Initialize Data

        //Get Room Types
        roomtypes = data[0].roomtypes.map(x => x.name);
        roomtypes.sort();

        //Get All Hotels
        hotels = data[1].entries;

        //Get Hotel Names for Autocomplete
        var HotelNames = hotels.map(x => x.hotelName);
        autocompleteNames = [...new Set(HotelNames)]; 
        autocompleteNames.sort();

        //Get Max Price
        MaxPrice = hotels.reduce((max, hotel) => (max.price > hotel.price) ? max :hotel).price;

        //Get Available Property Types
        var HotelTypes = hotels.map(x => x.rating);
        PropertyTypes = [...new Set(HotelTypes)];
        PropertyTypes.sort();

        //Get Guest Rating
        var HotelGuestratings = hotels.map(x => x.ratings.text);
        GuestRatings = [...new Set(HotelGuestratings)];

        //Get Hotel Locations
        var HotelLocations = hotels.map(x => x.city);
        Locations = [...new Set(HotelLocations)];
        Locations.sort();

        //Get Hotel Filters
        var HotelFilters = hotels.map(x => x.filters);
        var CompinedFilters = [];

        for (var i = 0; i < HotelFilters.length; i++) {
            for (var j = 0; j < HotelFilters[i].length; j++) {
                CompinedFilters.push(HotelFilters[i][j].name)
            }
        }
        CompinedFilters.sort();
        Filters = [...new Set(CompinedFilters)];

        //-------------- Construct DOM --------------------

        //A1-- Populate Data For Autocomplete
        var autoCompleteElements = autocompleteNames.map(x => `<option value ="${x}>"`);
        hotelsAuto.append(autoCompleteElements);

        //A2-- Populate Data For RoomTypes DropDown
        var roomTypesElements = roomtypes.map(x => `<option value="${x}">${x}</option>`);
        roomsDrop.append(roomTypesElements);

        //A3-- Populate Max Price Field
        maxPriceText.html(`<span>max.$ ${MaxPrice}</span>`);

        //A4-- Populate Max Attribute Price in Input Range and Change Max Price To Input Event
        priceRange.attr("max", MaxPrice);
        priceRange.val(MaxPrice);

        priceRange.on("input", function () {
            maxPriceText.html(`<span>max.$ ${$(this).val()}</span>`);
        });

        //A5-- Populate Property Types
        propertyTypeDrop.prepend("<option value=''>All</option>");
        for (var i = 0; i < PropertyTypes.length; i++) {
            switch (PropertyTypes[i]) {
                case 5: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">☆☆☆☆☆</option`); break; 
                case 4: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">☆☆☆☆</option`); break;
                case 3: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">☆☆☆</option`); break;
                case 2: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">☆☆</option`); break;
                case 1: propertyTypeDrop.append(`<option value="${PropertyTypes[i]}">☆</option`); break;
                default: break;
            }
        }

        //A6-- Populate Guest Rating
        guestRatingDrop.prepend("<option value=''>All</option>")
        for (var guestRating of GuestRatings) {
            if (guestRating == "Okay") guestRatingDrop.append(`<option value="${guestRating}">Okay 0 - 2</option>`)
            if (guestRating == "Fair") guestRatingDrop.append(`<option value="${guestRating}">Fair 2 - 6</option>`)
            if (guestRating == "Good") guestRatingDrop.append(`<option value="${guestRating}">Good 6 - 7</option>`)
            if (guestRating == "Very Good") guestRatingDrop.append(`<option value="${guestRating}">VeryGood 7 - 8.5</option>`)
            if (guestRating == "Excellent") guestRatingDrop.append(`<option value="${guestRating}">Excellent 8.5 - 10</option>`)
        }

        //A7-- Populate Hotel Locations
        hotelLocationDrop.prepend("<option value=''>All</option>");
        var LocationElements = Locations.map(x => `<option value="${x}">${x}</option>`);
        hotelLocationDrop.append(LocationElements);

        //A8-- Populate Filters
        moreFiltersDrop.prepend("<option value=''>All</option>")
        var FiltersElements = Filters.map(x => `<option value="${x}">${x}</option>`);
        moreFiltersDrop.append(FiltersElements);

        //Add Event Listeners 
        searchField.on('input', function () {
            cityName = $(this).val();
            Controller();
        });

        priceRange.on('input', function () {
            price = $(this).val();
            Controller();
        });

        propertyTypeDrop.on('input', function () {
            propertyType = $(this).val();
            Controller();
        });

        guestRatingDrop.on('input', function () {
            guestRating = $(this).val();
            Controller();
        });

        hotelLocationDrop.on('input', function () {
            hotelLocation = $(this).val();
            Controller();
        });

        moreFiltersDrop.on('input', function () {
            filters = $(this).val();
            Controller();
        });

        sortByDrop.on('input', function () {
            sortBy = $(this).val();
            Controller();
        });

        submitBtn.on('click', function () {
            propertyTypeDrop.val("");
            guestRatingDrop.val("");
            hotelLocationDrop.val("");
            moreFiltersDrop.val("");
            InitializeValues();
            Controller();
        });

        InitializeValues();
        //Controller
        Controller();

        function Controller() {
            filteredhotels = hotels;

            if (cityName) {
                filteredhotels = filteredhotels.filter(x => x.hotelName.toUpperCase().includes(cityName.toUpperCase()));
            }
            if (price) {
                filteredhotels = filteredhotels.filter(x => x.price <= price);
            }
            if (propertyType) {
                filteredhotels = filteredhotels.filter(x => x.rating == propertyType);
            }
            if (guestRating) {
                filteredhotels = filteredhotels.filter(x => x.ratings.text == guestRating);
            }
            if (hotelLocation) {
                filteredhotels = filteredhotels.filter(x => x.city == hotelLocation);
            }
            if (filters) {
                filteredhotels = filteredhotels.filter(x => x.filters.some(y => y.name == filters));
            }

            if (sortBy) {
                switch (sortBy) {
                    case "nameAsc": filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                    case "nameDesc": filteredhotels.sort((a, b) => a.hotelName > b.hotelName ? -1 : 1); break;
                    case "cityAsc": filteredhotels.sort((a, b) => a.city < b.city ? -1 : 1); break;
                    case "cityDesc": filteredhotels.sort((a, b) => a.city > b.city ? -1 : 1); break;
                    case "priceAsc": filteredhotels.sort((a, b) => a.price - b.price); break;
                    case "priceDesc": filteredhotels.sort((a, b) => b.price - a.price); break;
                    default: filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                }
            }


            hotelsSection.empty();
            if (filteredhotels.length > 0) {
                filteredhotels.forEach(ViewHotels);
            }
            else {
                ViewNoMoreHotels();
            }
        }

        //View
        function ViewHotels(hotel) {
            var element = `
 
                    <div class="hotel-card">
                <div class="photo" style="background: url('${hotel.thumbnail}'); background-position: center;">
                    <i class="fa fa-heart"></i>
                    <span>1/30</span>
                </div>

                <div class="details">
                    <h3>${hotel.hotelName}</h3>
                    <div class="rating" style="display:inline">
                        <div>
                            ${RatingStars(hotel.rating)}
                            <i>Hotel </i>
                        </div>
                    </div>

                    <div class="location">
                        ${hotel.city},0.2 Miles to Champs Elysees
                    </div>

                    <div class="reviews">
                        <span class="total">${hotel.ratings.no.toFixed(1)}</span>
                        <b>${hotel.ratings.text}</b>
                        <small>(1736)</small>
                    </div>

                    <div class="location-reviews">
                        Excellent location <small>(9.2/10)</small>
                    </div>
                </div>

                <div class="third-party-prices">
                    <div class="sites-and-prices">
                        <div class="highlited">
                            Hotel website
                            <strong>$706</strong>
                        </div>
                        <div>
                            Agoda
                            <strong>$575</strong>
                        </div>
                        <div>
                            Travelocity
                            <strong>$708</strong>
                        </div>
                    </div>


                    <div class="more-deals">
                        <strong>More deals from</strong>
                        <strong>$575 &or;</strong>
                    </div>
                </div>

                <div class="call-to-action">
                    <div class="price">

                        <div class="before-discount">
                            HotelPower.com
                            <strong><s> $${(hotel.price * 1.1).toFixed(0)}</s></strong>
                        </div>

                        <div class="after-discount">
                            Travelocity
                            <strong> $${hotel.price}</strong>
                            <div class="total">
                                3 nights for <strong>$${hotel.price*3}</strong>
                            </div>

                            <div class="usp">
                                ${hotel.filters.map(x => `<span>${x.name +" "}</span>`)}
                                
                            </div>
                        </div>

                        <div class="button">
                            <a href="#">View Deal</a>
                        </div>
                    </div>
                </div>
            </div>
                            `;
            hotelsSection.append(element);
        };

        function RatingStars(rating) {
            var eles = "";
            for (var i = 0; i < rating; i++) {
                eles += `<span class="fa fa-star"></span>` +" ";
            }
            return eles;
        };

        function ViewNoMoreHotels() {
            var noMoreHotelsElement = "<br/><h1>No hotels were found with these search criteria</h1><br/>";
            hotelsSection.append(noMoreHotelsElement);
        }

        function InitializeValues() {
            cityName = searchField.val();
            price = priceRange.val();
            propertyType = propertyTypeDrop.val();
            guestRating = guestRatingDrop.val();
            hotelLocation = hotelLocationDrop.val();
            filters = moreFiltersDrop.val();
            sortBy = sortByDrop.val();
        }
    }

    function ShowErrorPage(errorObject) {
        if (errorObject.status == 200) {
            var IS_JSON = true;
            try {
                var json = $.parseJSON(errorObject.responseText);
            } catch (err) {
                IS_JSON = false;
                var noMoreHotelsElement = `<br/><h1>Not valid JSON Format </h1><br/>`;
            }
        }
        else {
            var noMoreHotelsElement = `<br/><h1>${errorObject.status} -- ${errorObject.statusText}</h1><br/>`;
        }

        hotelsSection.append(noMoreHotelsElement);
    }
});