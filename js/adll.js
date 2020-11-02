//alert("you have successfully loaded the javascript file!");
//Load more posts button
var tempButton,
    ajaxCounter = 0;
jQuery(document).ready(function() {
    //var tempButton;
    
   jQuery( '#more-posts-button' ).on("click", function( e ) {
    e.preventDefault(); 
    jQuery('.anim-loading').addClass( 'spinner' );
    nonce = jQuery(this).attr("data-nonce");
    ajax_next_posts(); 
   }); 
    
        if (!sessionStorage) {
            return;
        }
        var savedHtml = sessionStorage.getItem("newHtml");
        var parsedHtml = JSON.parse(savedHtml);
        jQuery(".grid-container").append( parsedHtml.html );
        moveButton();
    
});

    function ajax_next_posts() {

        var postOffset = jQuery( '.outer' ).length;
        var postsPerPage = 16;

        //Ajax call itself
        jQuery.ajax({
            type: 'post',
            url:  ajaxlazyload.ajaxurl,
            data: {
                action: 'all_district_lazy_load',//action hook name
                offset: postOffset,
                nonce: nonce
            },
            //Ajax call is successful
            success: function ( html ) {
                if ( window.matchMedia("(max-width: 767px)").matches ) {
                    //alert(ajaxCounter);
                    if ( html.length == 0 ) {
                        jQuery('.button-wrapper').text("End of Recipes");
                    }
                    ajaxCounter += 1;
                    var newRowCount = ajaxCounter * postsPerPage + 15;
                    jQuery('.grid-container').css( "grid-template-rows", "repeat(" + newRowCount + ", 250px)" );
                }
//                 else if ( window.matchMedia("(max-width: 767px)").matches && ajaxCounter == 1 ) {
//                    alert(ajaxCounter);
//                    jQuery('.grid-container').css( "grid-template-rows", "repeat(41, 250px)" );
//                    ajaxCounter += 1;
//                }
                
                jQuery(".grid-container").append( html );
                moveButton();
                jQuery('.anim-loading').removeClass( 'spinner' );
                //jQuery(".grid-container").append( tempButton );
                //Add click event handler to all grid items including dynamic
                jQuery( '.outer, .goToRecipe' ).on('click', function() {
                    var page = {
                    scroll: jQuery(this).scrollTop(),
                    //Avoid duplicate loading of server-rendered posts
                    html: jQuery(".grid-container").html().slice( 10 )
                };
                sessionStorage.setItem('newHtml', JSON.stringify(page));
            });  
            },
            //Ajax call is not successful, still remove lock in order to try again
            error: function () {

            }
        });
    }

function moveButton() {
    var tempButton = jQuery('.button-wrapper').detach();
    jQuery(".grid-container").append( tempButton[0] );
}