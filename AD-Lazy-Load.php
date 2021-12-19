<?php
/*
Plugin Name: All District Lazy Load Plugin
Plugin URI: alldistrict.net
Description: This is a lightweight lazy load plugin created by All District Studios
Version: 1.0
Author: Kevin Wagner    
Author URI: alldistrict.net
Text Domain: ad-lazy-load
License: GPLv2
*/

function ad_lazy_load_enqueue_script() {   
    $randVer = rand(1, 100);//to pass as a random version number to wp_enqueue_script for cache busting
    if ( is_page_template('recipe-cards.php') ) {
        wp_register_style( 'ad_lazy_load_styles', plugin_dir_url( __FILE__ ) . 'css/adll-styles.css', array( 'bootstrap-css' ), '1.1' );
        wp_enqueue_style( 'ad_lazy_load_styles' );

        wp_enqueue_script( 'ad_lazy_load_script', plugin_dir_url( __FILE__ ) . 'js/adll.js', array('jquery'), $randVer );
        wp_localize_script( 'ad_lazy_load_script', 'ajaxlazyload', array( 'ajaxurl' => admin_url( 'admin-ajax.php' )));
    }
}
add_action('wp_enqueue_scripts', 'ad_lazy_load_enqueue_script');


add_action("wp_ajax_all_district_lazy_load", "ajax_load_more_button");
add_action("wp_ajax_nopriv_all_district_lazy_load", "ajax_load_more_button");

function ajax_load_more_button() {
    
    if ( !wp_verify_nonce( $_REQUEST['nonce'], "my_recipe_ajax_nonce")) {
      exit("Something has gone wrong. Please refresh the page an try again");
   } 
    
        $args = array(
            'post_type' => array('recipe', 'fc_recipe'),
            'post_status' => 'publish',
            'offset' => $_POST['offset'],
            'posts_per_page' => 16,
            'meta_query' => array(array('key' => '_thumbnail_id')),
            'category_name' => $_POST['categoryfilter'],
            's' => $_POST['categoryfilter']
        );
        // if filtering, don't add search in there
        if($_POST['actionType'] === 'FILTERING') {
            unset($args['s']);
        } // vice versa, if searching, don't need filter
        if($_POST['actionType'] === 'SEARCHING') {
            unset($args['category_name']);
        }
        
        $ajax_posts = new WP_Query($args);

    if ( $ajax_posts->have_posts() ) {
        while( $ajax_posts->have_posts() ) {
            $ajax_posts->the_post();
                
                get_template_part( 'template-parts/content', 'recipeSingleCards' );


        }
    }

    die();


}

add_action('wp_ajax_ad_category_filter', 'ad_category_filter_function'); // wp_ajax_{ACTION HERE} 
add_action('wp_ajax_nopriv_ad_category_filter', 'ad_category_filter_function');
 
function ad_category_filter_function(){
 
    if ( !wp_verify_nonce( $_REQUEST['nonce'], "my_recipe_ajax_nonce")) {
        exit("Something has gone wrong. Please refresh the page an try again");
     } 

    $args = array(
            'post_type' => array('recipe', 'fc_recipe'),
            'post_status' => 'publish',
            'posts_per_page' => 16,
            'category_name' => $_POST['categoryfilter'] //<-- this needs to be the slug value. will need to output slug as value of option element
    );
	// for taxonomies / categories
	if( isset( $_POST['categoryfilter'] ) )
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'category',
                'field' => 'id',
                'terms' => 'Drinks'//$_POST['categoryfilter']
            )
        );
 
 
        $ajax_posts = new WP_Query($args);

    if ( $ajax_posts->have_posts() ) {
        while( $ajax_posts->have_posts() ) {
            $ajax_posts->the_post();
                
                get_template_part( 'template-parts/content', 'recipeSingleCards' );


        }
    }

    die();
}



// Search stuff
add_action('wp_ajax_ad_search', 'ad_search_function'); // wp_ajax_{ACTION HERE} 
add_action('wp_ajax_nopriv_ad_search', 'ad_search_function');
function ad_search_function(){
 
    if ( !wp_verify_nonce( $_REQUEST['nonce'], "my_recipe_ajax_nonce")) {
        exit("Something has gone wrong. Please refresh the page an try again");
     } 

    $args = array(
            'post_type' => array('recipe', 'fc_recipe'),
            'post_status' => 'publish',
            'posts_per_page' => 16,
            's' => $_POST['categoryfilter'] //<-- this needs to be the slug value. will need to output slug as value of option element
    );
 
    $ajax_posts = new WP_Query($args);

    if ( $ajax_posts->have_posts() ) {
        while( $ajax_posts->have_posts() ) {
            $ajax_posts->the_post();
                
                get_template_part( 'template-parts/content', 'recipeSingleCards' );


        }
    }

    die();
}


