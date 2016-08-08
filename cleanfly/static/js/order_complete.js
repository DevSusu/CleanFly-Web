$(document).on('ready page:load', function() {
  $('#pricing-btn').on('click', function(e) {
    if( $('#pricing').hasClass('hide') ) {
      $('#pricing').removeClass('hide');
      $(this).text("가격표 숨기기");
    }
    else {
      $('#pricing').addClass('hide');
      $(this).text("가격표 펼치기");
    }
  });

  var collection_date =
    new moment(
      $('p[column="collection_date"]').text().slice(0,-4) + " " +
      $('p[column="collection_time"]').text() , ["YYYY-MM-DD HH:mm"]
    );

  var collection_str =
    (collection_date.month()+1) + "월" + collection_date.date() + "일 " +
    collection_date.hour() + "-" + (collection_date.hour()+1);

  $('#collection-text').text(collection_str + $('#collection-text').text() );

});
