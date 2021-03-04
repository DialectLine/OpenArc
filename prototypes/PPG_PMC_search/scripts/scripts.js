
let ppg = new Object();
ppg.data = new Object();
ppg.color = new Object();
ppg.filters = new Object();
ppg.currentSearch = new Array();
ppg.search = new Array();
ppg.searchResults = new Array();
ppg.maxSearchResultLimit = 2;

//Launch
function launchSite() {
    $.getJSON('data/search.json', function (json) {
        ppg.data = json.data;
        ppg.colors = json.colors;
        ppg.filters = json.filters;
    });
}

function toggleFilters() {
    let myFilters = $('.searchFilterContainer');
    if ($(myFilters).is(":visible")) {
        $(myFilters).hide();
    } else {
        $(myFilters).show();
    }
}

function filter(type, value) {
    let myFilter = document.createElement('div');
    $(myFilter).addClass('filter').addClass(type).addClass(value).attr('data-filter', type + '-' + value);
    $(myFilter).attr('onclick', 'removeQuickFilter(this);');
    if ($('.filters .' + type + '.' + value).length === 0) {
        $('.filters').append(myFilter);
    }

    //Set the filter
    let searchFilter = new Object({ "category": type, "value": value });
    ppg.currentSearch.push(searchFilter);

    //Set the focus back to the input
    $('input').focus().select();
}

function removeQuickFilter(me) {
    $(me).remove();
}

function processInput() {
    //Hide the search filter container.
    $('.searchFilterContainer').hide()
    if (event.keyCode === 13) {
        processSearch();
    } else {

        //Now get the content
        let myInput = $('input').val();

        //Only check after 3 characters
        let nChar = 2;
        if (myInput.length >= nChar) {
            //Run the content filter
            compareValues(myInput);
        } else {
            //Remove the suggestions
            $('.suggestions').remove();
        }

        //if there is no content at all, add the placeholder
    }
}

function addPlaceholder() {
    $('input').val('Type to search for a color, manufacturer etc.').addClass('placeholder');
}

function checkFocus() {
    //Test against the placeholder
    if (myInput.length === 0) {
        if ($('input').hasClass('placeholder')) {
            $('input').removeClass('placeholder').val('');
        }
    }
}

//Compare the values typed to the content
function compareValues(myValue) {

    //Only read the last word of the value
    let val = myValue.split(' ')[myValue.split(' ').length - 1];
    let myValues = [];
    $(ppg.data).each(function (index) {
        let thisCat = this.category;
        $(this.values).each(function (i2) {
            let thisLabel = this.label;
            $(this.values).each(function (i3) {
                if (this.toLowerCase() === val.toLowerCase()) {
                    let myVal = { "cat": thisCat, "label": thisLabel };
                    myValues.push(myVal);
                }
            });
        });
    })

    //Update the sugestions
    $('.suggestions').remove();

    let mysu = document.createElement('div');
    $(mysu).addClass('suggestions');
    $(myValues).each(function (index) {
        $(mysu).append('<div onClick="setCategory(this)" data-category="' + this.cat + '" data-value="' + this.label + '"><strong>' + this.label + '</strong> in <em>' + this.cat + '</em></div>');
    });
    $('stage').append(mysu);

}

//Setting the category
function setCategory(cat) {
    let myCat = $(cat).data('category');
    let myCatWr = myCat;
    if (myCat === 'manufacturer') {
        myCatWr = 'mfr';
    }
    let myVal = $(cat).data('value');
    let myFilter = new Object({ "category": myCat, "value": myVal });

    ppg.currentSearch.push(myFilter);
    //the new value
    let myQuery = '';
    let myQueryArr = $('input').val().split(' ');
    if (myQueryArr.length > 1) {
        let newVal = $('input').val().split(' ');
        newVal.pop();
        myQuery = newVal.join(' ') + ' ' + myCatWr + ":" + myVal + " ";
    } else {
        myQuery = myCatWr + ":" + myVal + " ";
    }
    $('input').val(myQuery).focus();
    $('.suggestions').html('').remove();
}

//Clear the search
function clearSearch() {
    ppg.currentSearch = [];
    $('.filterList').html('').remove();
    $('.filters').html('');
    $('input').val('');
    $('input').focus();

}

//Do the actual search
function processSearch() {

    ppg.processSearch = ppg.currentSearch;

    //Clear search
    $('.filterList').html('').remove();
    $('.suggestions').html('').remove();
    $('.subFilters').html('').remove();

    //Clear warning
    $('.warningHeader').remove();

    //Remove Search
    $('.resultList').remove();

    //get entered value
    let myVal = '';
    if (!$('input').hasClass('placeholder')) {
        $('input').val();
    }

    //Remove all the values that are filtered already
    let myValArr = myVal.split(' ');
    $(myValArr).each(function (i) {
        if (String(this).indexOf(':') === -1) {
            if (String(this).length > 0) {
                ppg.currentSearch.push({ "category": "other", "value": String(this) });
            }
        }
    });

    //get filters
    let myFilters = [];
    $('.filters .filter').each(function (index) {
        myFilters.push($(this).data('filter'));
    });

    //my Filters
    let filterList = document.createElement('div');
    $(filterList).addClass('filterList');

    $(filterList).append('<span>You searched for:</span>');

    //My Results
    $(ppg.processSearch).each(function (i) {
        let thisFilter = '<div class="queryFilter" onclick="removeFilter(this)" data-category="' + this.category + '" data-value="' + this.value + '">' + this.category + ': <strong>' + this.value + '</strong><div class="fa fa-times"></div></div>';
        $(filterList).append(thisFilter);
    });

    $('.prototypeMain').append(filterList);

    ppg.currentSearch = [];
    $('input').val('');
    $('.filters').html('');

    //Perform the search
    ppg.searchResults = searchData();

    //Filters for too many result
    if (ppg.searchResults.length > ppg.maxSearchResultLimit) {
        showManyResultWarning();
    } else {
        //Display the results
        let myResultList = document.createElement('div');
        $(myResultList).addClass('resultList');

        //Adding the color cards
        $(ppg.searchResults).each(function (i) {
            let myCard = document.createElement('div');
            $(myCard).addClass('colorCard');

            $(myCard).append('<div class="ccBackground"></div><div class="ccContainer"><div class="ccHeader"><h3>' + this.codes[0].value + '</h3></div><div class="ccContent">\
                <h3>' + this.name + '</h3>\
                <div>Manufacturer: <strong>' + this.manufacturer + '</strong></div>\
                <div>Use:  <strong>' + this.use + '</strong></div>\
            </div></div>');
            $(myResultList).append(myCard);

            //Add the background color
            $(myCard).find('.ccBackground').attr('style', 'background-color:' + this.backgroundColor);
            $(myCard).find('.ccHeader').find('h3').attr('style', 'color:' + this.foregroundColor);

        });

        $('.prototypeMain').append(myResultList);
    }
}


function searchData() {
    let myResults = [];
    $(ppg.processSearch).each(function (i) {
        let thisResultList = [];
        let myFilter = this;
        $(ppg.colors).each(function (ci) {
            let myColor = this;
            $.each(ppg.colors[ci], function (key, val) {
                if (typeof val === typeof []) {
                    //This is an array
                    $(val).each(function (ci2) {
                        if (String(this.value).toLowerCase() === String(myFilter.value).toLowerCase()) {
                            thisResultList.push(myColor);
                            return false;
                        }
                    });
                } else {
                    //This is a string
                    if (String(val).toLowerCase() === String(myFilter.value).toLowerCase()) {
                        thisResultList.push(myColor);
                        return false;
                    }
                }
            });
        });
        if (thisResultList.length > 0) {
            myResults.push(thisResultList);
        }
    });

    //Now compare the result lists
    let resultList = [];

    //If there is more than one filter, compare the filter results first. If there is only one, copy all the results from that single filter.
    //We go 5 levels deep now. This should be written smarter - but it is late. I am tired. I want to go to bed... so suck it!
    if (ppg.processSearch.length > 1) {
        if (myResults.length > 1) {
            //So there is more than one filter. Let's check them
            let myFilterLength = myResults.length; 1
            $(myResults[0]).each(function (i1) {
                let myItem = this;
                //Go through array 2
                $(myResults[1]).each(function (i2) {
                    if (this === myItem) {
                        //now go to the next level
                        if (myFilterLength > 2) {
                            $(myResults[2]).each(function (i3) {
                                if (this === myItem) {
                                    //now go to the next level
                                    if (myFilterLength > 3) {
                                        $(myResults[3]).each(function (i4) {
                                            if (this === myItem) {
                                                //now go to the next level
                                                if (myFilterLength > 4) {
                                                    $(myResults[4]).each(function (i5) {
                                                        if (this === myItem) {
                                                            //Found it
                                                            resultList.push(myItem);
                                                        }
                                                    });
                                                } else {
                                                    //Found it
                                                    resultList.push(myItem);
                                                }
                                            }
                                        });
                                    } else {
                                        //Found it
                                        resultList.push(myItem);
                                    }
                                }
                            });
                        } else {
                            //Found it
                            resultList.push(myItem);
                        }
                    }
                });
            });
        }
    } else {
        resultList = myResults[0];
    }
    return resultList;
}

function showManyResultWarning() {
    let myWarning = document.createElement('div');
    $(myWarning).addClass('warningHeader');
    $(myWarning).insertBefore('.filterList');

    addSubFilters();
}

function addSubFilters() {
    let mySubFilters = document.createElement('div');
    $(mySubFilters).addClass('subFilters');

    //This is old stuff, let's really show the brands we have
    /*
    $(ppg.filters).each(function (i) {
        console.log("hello", this);
        let mfGroup = document.createElement('div');
        $(mfGroup).addClass('filterGroup');
        $(mfGroup).append('<label>' + this.type + '</label>');
        let thisCat = this;
        $(this.values).each(function (i) {
            $(mfGroup).append('<div class="subFilter" data-category="' + thisCat.type + '" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
        });
        $(mySubFilters).append(mfGroup);
    });
    */

    let myFilterLists = new Object({"manufacturer":[],"country":[],"color":[],"use":[], "group":[], "type":[], "year":[]});

    //Go through the active search results
    $(ppg.searchResults).each(function (i) {
        //mfr
        if (myFilterLists.manufacturer.indexOf(this.manufacturer) === -1) {
            myFilterLists.manufacturer.push(this.manufacturer);
        }
        //color
        if (myFilterLists.color.indexOf(this.color) === -1) {
            myFilterLists.color.push(this.color);
        }
        //year
        if (myFilterLists.year.indexOf(this.year) === -1) {
            myFilterLists.year.push(this.year);
        }
        //country
        if (myFilterLists.country.indexOf(this.country) === -1) {
            myFilterLists.country.push(this.country);
        }
        //use
        if (myFilterLists.use.indexOf(this.use) === -1) {
            myFilterLists.use.push(this.use);
        }
        //group
        if (myFilterLists.group.indexOf(this.group) === -1) {
            myFilterLists.group.push(this.group);
        }
        //type
        if (myFilterLists.type.indexOf(this.type) === -1) {
            myFilterLists.type.push(this.type);
        }
    });


    //Add the filter groups
    if (typeof myFilterLists.manufacturer !== typeof undefined) {
        if (myFilterLists.manufacturer.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Manufacturer</label>');
            $(myFilterLists.manufacturer).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="manufacturer" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }
    if (typeof myFilterLists.country !== typeof undefined) {
        if (myFilterLists.country.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Country</label>');
            $(myFilterLists.country).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="country" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }
    if (typeof myFilterLists.color !== typeof undefined) {
        if (myFilterLists.color.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Color</label>');
            $(myFilterLists.color).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="color" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }

    if (typeof myFilterLists.use !== typeof undefined) {
        if (myFilterLists.use.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Use</label>');
            $(myFilterLists.use).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="use" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }

    if (typeof myFilterLists.group !== typeof undefined) {
        if (myFilterLists.group.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Group</label>');
            $(myFilterLists.group).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="group" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }

    if (typeof myFilterLists.type !== typeof undefined) {
        if (myFilterLists.type.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Type</label>');
            $(myFilterLists.type).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="type" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }
    if (typeof myFilterLists.year !== typeof undefined) {
        if (myFilterLists.year.length > 1) {
            let mfGroup = document.createElement('div');
            $(mfGroup).addClass('filterGroup');
            $(mfGroup).append('<label>Year</label>');
            $(myFilterLists.year).each(function (i) {
                $(mfGroup).append('<div class="subFilter" data-category="year" data-value="' + this + '" onclick="addFilter(this)">' + this + '</div>');
            });
            $(mySubFilters).append(mfGroup);
        }
    }


    $(mySubFilters).insertAfter('.warningHeader');
}

function addFilter(me) {
    let myFilter = new Object({ "category": $(me).data("category"), "value": $(me).data('value') });

    //The ppg switcheroo
    ppg.currentSearch = ppg.processSearch;
    ppg.currentSearch.push(myFilter);
    processSearch();
}

function removeFilter(me) {
    //Go through the processed search
    let myFilter = new Object({ "category": $(me).data("category"), "value": $(me).data('value') });
    let myIndexToRemove = -1;
    $(ppg.processSearch).each(function (i) {
        if (String(this) === String(myFilter)) {
            myIndexToRemove = i + 1;
            return false;
        }
    });

    if (myIndexToRemove !== -1) {
        if (ppg.processSearch.length > 1) {
            ppg.processSearch.splice(myIndexToRemove, 1);
        } else {
            clearSearch();
        }
    }

    //The ppg switcheroo
    ppg.currentSearch = ppg.processSearch;
    processSearch();
}