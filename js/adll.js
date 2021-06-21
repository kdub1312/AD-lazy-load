/**************** COMPONENTS *********************/
// const searchBar = `
// <div class="searchContainer">
//     <input value="" id="searchInput" placeholder="type something..."/>
//     <button class="searchBtn">Search Recipes</button>
// </div>
// `

/**** CONSTANTS *****/
const FILTERING = 'FILTERING';
const SEARCHING = 'SEARCHING';

jQuery(document).ready(function () {
    // Add searchbar to page
    // jQuery('#main').prepend(searchBar)

    // filtering or searching
    let actionType = null;

    //Load more posts button
    var morePostsBtn = jQuery('#more-posts-button');

    // Declaring it once here
    var nonce = jQuery('#more-posts-button').attr("data-nonce");

    //MORE POSTS BUTTON
    jQuery('#more-posts-button').on("click", function (e) {
        e.preventDefault();
        jQuery('.anim-loading').addClass('spinner');
        jQuery('#more-posts-button').hide();
        ajax_next_posts();
    });

    //CATEGORY FILTER
    jQuery('#categoryFilter').on('click', function (e) {
        console.log("button clicked!!");
        e.preventDefault();
        // set our action to filtering
        actionType = FILTERING;
        filter_posts();
    });

    //SEARCH BAR
    // Attach a click event to the search button
    jQuery('.searchBtn').on('click', search_posts)


    if (!sessionStorage) return;

    // var savedHtml = sessionStorage.getItem("newHtml");
    // console.log('saved html', sessionStorage)
    // var parsedHtml = JSON.parse(savedHtml);
    // jQuery(".grid-container").append(parsedHtml.html);
    moveButton();
    function search_posts(e) {
        e.preventDefault();
        // reset select to empty
        jQuery('.categoryfilter')[0].value = ""
        // set our action to searching
        actionType = SEARCHING;

        // grab search term
        const searchTerm = document.getElementById("searchInput").value;

        // do validation here...
        if (searchTerm.length < 1) return alert('Search must not be empty!')

        // make ajax request
        jQuery.ajax({
            type: 'post',
            url: ajaxlazyload.ajaxurl,
            data: {
                action: 'ad_search', //action hook name
                categoryfilter: searchTerm,
                nonce: nonce
            },
            // handle the successful response
            success: (response) => {
                // see if we need to change btn text
                if (response.length != 0) morePostsBtn.text("Load More Posts");
                if (response.length === 0) morePostsBtn.text("End of Recipes");
                const cachedMorePostsBtn = jQuery('.button-wrapper').detach();
                jQuery(".grid-container").empty().append(response);
                moveButton(cachedMorePostsBtn);
            },
            //Ajax call is not successful, still remove lock in order to try again
            error: function (err) {
                console.log("there was an error with the ajax request", err);
            }

        })
    }

    function filter_posts() {
        // reset search value to empty
        document.getElementById("searchInput").value = ""
        var filterCatVal = jQuery('.categoryfilter').find(":selected").val();
        //Ajax call itself
        jQuery.ajax({
            type: 'post',
            url: ajaxlazyload.ajaxurl,
            data: {
                action: 'ad_category_filter', //action hook name
                categoryfilter: filterCatVal,
                nonce: nonce
            },
            //Ajax call is successful
            success: function (html) {
                if (html.length != 0 && morePostsBtn.text() == "End of Recipes") {
                    morePostsBtn.text("Load More Posts");
                }

                var cachedMorePostsBtn = jQuery('.button-wrapper').detach();
                jQuery(".grid-container").empty().append(html);
                moveButton(cachedMorePostsBtn);

                //Add click event handler to all grid items including dynamic
                jQuery('.outer, .goToRecipe').on('click', function () {
                    var page = {
                        scroll: jQuery(this).scrollTop(),
                        //Avoid duplicate loading of server-rendered posts
                        html: jQuery(".grid-container").html().slice()//THIS IS NOT WORKING, SOME POSTS BEING DUPLICATED
                    };
                    sessionStorage.setItem('newHtml', JSON.stringify(page));
                });
            },
            //Ajax call is not successful, still remove lock in order to try again
            error: function () {
                console.log("there was an error with the ajax request");
            }
        });
    }

    function ajax_next_posts() {
        var postOffset = jQuery('.outer').length;

        // check to see if we are filtering, searching or neither.
        let filterCatVal = null;
        if (actionType === FILTERING) {
            filterCatVal = jQuery('.categoryfilter').find(":selected").val();
        } else if (actionType === SEARCHING) {
            filterCatVal = document.getElementById("searchInput").value;
        }

        var postsData = {
            action: 'all_district_lazy_load',//action hook name
            offset: postOffset,
            nonce: nonce,
            actionType,
        }

        if (filterCatVal != null) {
            postsData['categoryfilter'] = filterCatVal;
        }
        //Ajax call itself
        jQuery.ajax({
            type: 'post',
            url: ajaxlazyload.ajaxurl,
            data: postsData,
            //Ajax call is successful
            success: function (html) {
                //MOVED THIS OUT OF COMMENTED CODE TO APPLY AT ALL SCREEN SIZES
                if (html.length == 0) {
                    console.log('hello from inside of successful eval!!!!!!');
                    morePostsBtn.text("End of Recipes");
                }

                jQuery(".grid-container").append(html);
                if (window.matchMedia("(min-width: 768px)").matches) {
                    var cardsAfterAjax = jQuery('.outer').length;
                    var remainder = cardsAfterAjax % 3;
                    var divider = cardsAfterAjax - remainder;
                    var newRowNumb = divider / 3;
                    jQuery(".grid-container").css("grid-template-rows", "repeat(" + newRowNumb + ", 275px");
                } else {//mobile screens
                    var cardsAfterAjax = jQuery('.outer').length;
                    jQuery(".grid-container").css("grid-template-rows", "repeat(" + cardsAfterAjax + ", 250px");
                }

                moveButton();
                jQuery('.anim-loading').removeClass( 'spinner' );
                jQuery('#more-posts-button').show();
                //Add click event handler to all grid items including dynamic
                jQuery('.outer, .goToRecipe').on('click', function () {
                    var page = {
                        scroll: jQuery(this).scrollTop(),
                        //Avoid duplicate loading of server-rendered posts
                        html: jQuery(".grid-container").html().slice(16)//THIS IS NOT WORKING, SOME POSTS BEING DUPLICATED
                    };
                    sessionStorage.setItem('newHtml', JSON.stringify(page));
                });
            },
            //Ajax call is not successful, still remove lock in order to try again
            error: function () {
                console.log('next posts error');
            }
        });
    }

    function moveButton(cachedBtn) {
        if (!cachedBtn) {
            var tempButton = jQuery('.button-wrapper').detach();
            jQuery(".grid-container").append(tempButton[0]);
        } else {
            jQuery(".grid-container").append(cachedBtn[0]);
        }

    }

});