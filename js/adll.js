/**** CONSTANTS *****/
const FILTERING = 'FILTERING';
const SEARCHING = 'SEARCHING';

jQuery(document).ready(function () {
    // filtering or searching
    let actionType = null;
    //Load more posts button
    var $morePostsBtn = jQuery('#more-posts-button');
    //Load loading animation element
    var $animLoadEl = jQuery('.anim-loading');
    //Load filter select box
    var $filterSelectBox = jQuery('.categoryfilter');
    //Load search input
    var $searchInput = jQuery("#searchInput");
    //Load grid container
    var $gridContainer = jQuery(".grid-container");
    // Declaring nonce once here
    var nonce = $morePostsBtn.attr("data-nonce");

    //MORE POSTS BUTTON
    $morePostsBtn.on("click", function (e) {
        e.preventDefault();
        $animLoadEl.addClass('spinner');
        $morePostsBtn.hide();
        ajax_next_posts();
    });

    //CATEGORY FILTER
    jQuery('#categoryFilter').on('click', filter_posts);

    //SEARCH BAR
    jQuery('.searchBtn').on('click', search_posts)

    if (!sessionStorage) return;

    moveButton();

    function search_posts(e) {
        e.preventDefault();
        // set our action to searching
        actionType = SEARCHING;
        // reset select to empty
        $filterSelectBox[0].value = "";

        // grab search term
        const searchTerm = $searchInput.val();

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
                if (response.length != 0) $morePostsBtn.text("Load More Posts");
                if (response.length === 0) $morePostsBtn.text("End of Recipes");
                const cachedMorePostsBtn = jQuery('.button-wrapper').detach();
                $gridContainer.empty().append(response);
                moveButton(cachedMorePostsBtn);
            },
            //Ajax call is not successful, still remove lock in order to try again
            error: function (err) {
                console.log("there was an error with the ajax request", err);
            }

        })
    }

    function filter_posts(e) {
        e.preventDefault();
        // set our action to filtering
        actionType = FILTERING;
        // reset search value to empty
        $searchInput.val("");

        var filterCatVal = $filterSelectBox.find(":selected").val();
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
                if (html.length != 0 && $morePostsBtn.text() == "End of Recipes") {
                    $morePostsBtn.text("Load More Posts");
                }

                var cachedMorePostsBtn = jQuery('.button-wrapper').detach();
                $gridContainer.empty().append(html);
                moveButton(cachedMorePostsBtn);

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
            filterCatVal = $filterSelectBox.find(":selected").val();
        } else if (actionType === SEARCHING) {
            filterCatVal = $searchInput.val();
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
                    $morePostsBtn.text("End of Recipes");
                }

                $gridContainer.append(html);
                
                if (window.matchMedia("(min-width: 768px)").matches) {
                    var cardsAfterAjax = jQuery('.outer').length;
                    var remainder = cardsAfterAjax % 3;
                    var divider = cardsAfterAjax - remainder;
                    var newRowNumb = divider / 3;
                    $gridContainer.css("grid-template-rows", "repeat(" + newRowNumb + ", 275px");
                } else {//mobile screens
                    var cardsAfterAjax = jQuery('.outer').length;
                    $gridContainer.css("grid-template-rows", "repeat(" + cardsAfterAjax + ", 250px");
                }

                moveButton();
                $animLoadEl.removeClass( 'spinner' );
                $morePostsBtn.show();

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
            $gridContainer.append(tempButton[0]);
        } else {
            $gridContainer.append(cachedBtn[0]);
        }

    }

});