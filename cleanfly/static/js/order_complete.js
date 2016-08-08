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
    new Date(
      $('p[column="collection_date"]').text().slice(0,-4) + " " +
      $('p[column="collection_time"]').text()
    );

  var collection_str =
    (collection_date.getMonth()+1) + "월" + collection_date.getDay() + "일 " +
    collection_date.getHours() + "-" + (collection_date.getHours()+1);

  $('#collection-text').text(collection_str + $('#collection-text').text() );

});
