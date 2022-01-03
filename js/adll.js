/**** CONSTANTS *****/
const FILTERING = "FILTERING";
const SEARCHING = "SEARCHING";

window.onload = function () {
    const postsPerPage = 16 // Important!! check php file. If that changes, then this must change
  // filtering or searching
  let actionType = null;
  // keep track of more post clicks
  let pageCount = sessionStorage.getItem("page")
    ? Number(sessionStorage.getItem("page"))
    : 0;
    console.log('here', pageCount)

  //Load more posts button
  var $morePostsBtn = jQuery("#more-posts-button");
  //Load loading animation element
  var $animLoadEl = jQuery(".anim-loading");
  //Load filter select box
  var $filterSelectBox = jQuery(".categoryfilter");
  //Load search input
  var $searchInput = jQuery("#searchInput");
  //Load grid container
  var $gridContainer = jQuery(".grid-container");
  // Declaring nonce once here
  var nonce = $morePostsBtn.attr("data-nonce");

  // check and see if we are in a session
  const searchState = sessionStorage.getItem("search");
  const filterState = sessionStorage.getItem("filter");

  if (searchState) {
    $searchInput.val(searchState);
    $gridContainer.hide();
    search_posts().then(() => {
        console.log("before loop s", pageCount, typeof pageCount);

        let postCount = postsPerPage
        for (let i = 0; i < pageCount; i++) {
          console.log("in loop s", postCount);

          ajax_next_posts(postCount);
          postCount += postsPerPage
          console.log("in loop s1"), postCount;
        }
        console.log("befo secroll");
        const pagePostion = sessionStorage.getItem("pagePostion") ? Number(sessionStorage.getItem("pagePostion")) : 0
        window.scrollTo(0, pagePostion)
    });
  }
  if (filterState) {
    $filterSelectBox.val(filterState);
    $gridContainer.hide();
    filter_posts().then(() => {
      for (let i = 0; i < pageCount; i++) {
        console.log("in loop f");
        getMorePosts();
      }
    });
  }
  //MORE POSTS BUTTON
  $morePostsBtn.on("click", getMorePosts);

  //CATEGORY FILTER
  jQuery("#categoryFilter").on("click", filter_posts);

  //SEARCH BAR
  jQuery(".searchBtn").on("click", search_posts);

  window.addEventListener('popstate',scrollLogic );

    window.addEventListener("hashchange", scrollLogic, false);

    const scrollLogic = () => {
      debugger
      Alert('clicked inner' )
      sessionStorage.setItem("pagePostion", window.scrollY) }
  // if (!sessionStorage) return;

  // moveButton();

  function getMorePosts(e) {
    if (e) e.preventDefault();
    $animLoadEl.addClass("spinner");
    $morePostsBtn.hide();
    ajax_next_posts();
    pageCount += 1;
    // set session storage for page
    sessionStorage.setItem("page", pageCount);
  }

  function search_posts(e) {
    console.log("starting search");
    if (e){
      e.preventDefault();
      // set a new session storage for page - new search
      sessionStorage.setItem("page", 0);
      sessionStorage.setItem("pagePostion", 0);
      pageCount = 0

    } 

    // set our action to searching
    actionType = SEARCHING;
    // reset select to empty
    $filterSelectBox[0].value = "";

    // grab search term
    const searchTerm = $searchInput.val();

    // set session storage for seaching
    sessionStorage.setItem("search", searchTerm);

    // remove the filtering from storage
    sessionStorage.removeItem("filter");

    // do validation here...
    if (searchTerm.length < 1) return alert("Search must not be empty!");

    // make ajax request
    return jQuery.ajax({
      type: "post",
      url: ajaxlazyload.ajaxurl,
      data: {
        action: "ad_search", //action hook name
        categoryfilter: searchTerm,
        nonce: nonce,
      },
      // handle the successful response
      success: (response) => {
        console.log("success");
        // see if we need to change btn text
        if (response.length != 0) $morePostsBtn.text("Load More Posts");
        if (response.length === 0) $morePostsBtn.text("End of Recipes");
        const cachedMorePostsBtn = jQuery(".button-wrapper").detach();
        $gridContainer.empty().append(response);
        $gridContainer.show();
        moveButton(cachedMorePostsBtn);
      },
      //Ajax call is not successful, still remove lock in order to try again
      error: function (err) {
        console.log("there was an error with the ajax request", err);
      },
    });
  }

  function filter_posts(e) {
    if (e) e.preventDefault();
    // set a new session storage for page
    // sessionStorage.setItem("page", 0);
    // set our action to filtering
    actionType = FILTERING;
    // reset search value to empty
    $searchInput.val("");

    const filterCatVal = $filterSelectBox.find(":selected").val();

    // set session storage for filtering
    sessionStorage.setItem("filter", filterCatVal);

    // remove the search from storage
    sessionStorage.removeItem("search");

    //Ajax call itself
    return jQuery.ajax({
      type: "post",
      url: ajaxlazyload.ajaxurl,
      data: {
        action: "ad_category_filter", //action hook name
        categoryfilter: filterCatVal,
        nonce: nonce,
      },
      //Ajax call is successful
      success: function (html) {
        if (html.length != 0 && $morePostsBtn.text() == "End of Recipes") {
          $morePostsBtn.text("Load More Posts");
        }

        const cachedMorePostsBtn = jQuery(".button-wrapper").detach();
        $gridContainer.empty().append(html);
        $gridContainer.show();
        moveButton(cachedMorePostsBtn);
      },
      //Ajax call is not successful, still remove lock in order to try again
      error: function () {
        console.log("there was an error with the ajax request");
      },
    });
  }

  function ajax_next_posts(postOffset) {
    if(!postOffset) postOffset = jQuery(".outer").length;

    // check to see if we are filtering, searching or neither.
    let filterCatVal = null;
    if (actionType === FILTERING) {
      filterCatVal = $filterSelectBox.find(":selected").val();
    } else if (actionType === SEARCHING) {
      filterCatVal = $searchInput.val();
    }

    const postsData = {
      action: "all_district_lazy_load", //action hook name
      offset: postOffset,
      nonce: nonce,
      actionType,
    };

    if (filterCatVal != null) {
      postsData["categoryfilter"] = filterCatVal;
    }
    //Ajax call itself
    return jQuery.ajax({
      type: "post",
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
          const cardsAfterAjax = jQuery(".outer").length;
          const remainder = cardsAfterAjax % 3;
          const divider = cardsAfterAjax - remainder;
          const newRowNumb = divider / 3;
          $gridContainer.css(
            "grid-template-rows",
            "repeat(" + newRowNumb + ", 275px"
          );
        } else {
          //mobile screens
          const cardsAfterAjax = jQuery(".outer").length;
          $gridContainer.css(
            "grid-template-rows",
            "repeat(" + cardsAfterAjax + ", 250px"
          );
        }

        moveButton();
        $animLoadEl.removeClass("spinner");
        $morePostsBtn.show();
      },
      //Ajax call is not successful, still remove lock in order to try again
      error: function () {
        console.log("next posts error");
      },
    });
  }

  function moveButton(cachedBtn) {
    if (!cachedBtn) {
      console.log("no cache btn");
      var tempButton = jQuery(".button-wrapper").detach();
      $gridContainer.append(tempButton[0]);
    } else {
      console.log("cache btn", cachedBtn[0]);

      $gridContainer.append(cachedBtn[0]);
    }
  }
};
