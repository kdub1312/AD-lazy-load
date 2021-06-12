/**************** COMPONENTS *********************/
const searchBar = `
<div class="searchContainer">
    <input value="" id="searchInput" class="btn btn-default" />
    <button class="searchBtn">Search Recipes</button>
</div>
`
const Recipe = (data) => (`<div>${data}</div>`)

// https://demo.wprecipemaker.com/wp-json/wp/v2/wprm_recipe/?wprm_ingredient=21
jQuery(document).ready(function () {
    //Load more posts button
    var morePostsBtn = jQuery('#more-posts-button');
    // console.log(morePostsBtn);
    //MORE POSTS BUTTON
    jQuery('#more-posts-button').on("click", function (e) {
        e.preventDefault();
        jQuery('.anim-loading').addClass('spinner');
        nonce = jQuery(this).attr("data-nonce");
        console.log('nonce', nonce)
        ajax_next_posts();
    });

    //CATEGORY FILTER
    jQuery('#categoryFilter').on('click', function (e) {
        console.log("button clicked!!");
        e.preventDefault();
        nonce = jQuery('#more-posts-button').attr("data-nonce");
        filter_posts();
    });

     //SEARCH BAR
    // Add to page
    jQuery('#main').prepend(searchBar)
    // Attach a click event to the search button
    jQuery('.searchBtn').on('click', e => {
        e.preventDefault();
        const searchTerm = document.getElementById("searchInput").value;
        const nonceSearch = jQuery('#more-posts-button').attr("data-nonce");
        if(searchTerm.length < 1) return alert('Search must not be empty!')
        console.log('searching...', searchTerm, nonceSearch)
        console.log(ajaxlazyload.ajaxurl)

        jQuery.ajax({
            type: 'post',
            url: ajaxlazyload.ajaxurl,
            data: {
                action: 'ad_search', //action hook name
                categoryfilter: searchTerm,
                nonce: nonceSearch
            },
            success: (response) => {
                console.log('res', response)
                jQuery(".grid-container").empty().append(response);
            }

        })
    })
    if (!sessionStorage) {
        return;
    }
    // var savedHtml = sessionStorage.getItem("newHtml");
    // console.log('saved html', sessionStorage)
    // var parsedHtml = JSON.parse(savedHtml);
    // jQuery(".grid-container").append(parsedHtml.html);
    moveButton();

    function filter_posts() {
        var filterCatVal = jQuery('.categoryfilter').find(":selected").val();
        //Ajax call itself
        console.log(ajaxlazyload.ajaxurl)
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
                console.log('html', html)
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
        var filterCatVal = jQuery('.categoryfilter').find(":selected").val();
        var postsData = {
            action: 'all_district_lazy_load',//action hook name
            offset: postOffset,
            nonce: nonce
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
                    console.log(morePostsBtn);
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
                jQuery('.anim-loading').removeClass('spinner');
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