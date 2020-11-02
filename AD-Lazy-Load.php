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
    if ( is_page_template('recipe-cards.php') ) {
        wp_register_style( 'ad_lazy_load_styles', plugin_dir_url( __FILE__ ) . 'css/adll-styles.css', array( 'bootstrap-css' ), '1.0' );
        wp_enqueue_style( 'ad_lazy_load_styles' );

        wp_enqueue_script( 'ad_lazy_load_script', plugin_dir_url( __FILE__ ) . 'js/adll.js', array('jquery'), '1.0' );
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
            'post_type' => 'recipe',
            'post_status' => 'publish',
            'offset' => $_POST['offset'],
            'posts_per_page' => 16,
            'meta_query' => array(array('key' => '_thumbnail_id'))
        );

        $ajax_posts = new WP_Query($args);

    if ( $ajax_posts->have_posts() ) {
        while( $ajax_posts->have_posts() ) {
            $ajax_posts->the_post();

//            if ( has_post_thumbnail() && get_post_status() != 'future' ) {
                
                get_template_part( 'template-parts/content', 'recipeSingleCards' );
                
//            }

        }
    }

    die();


}
