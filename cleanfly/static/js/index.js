$(document).on("ready page:load", function () {

  goods_array = [];
  order_loaded = false;

  $.ajax({
    url : "http://localhost/goods",
    success : function(result) {
      goods_array = $.extend(true,[],result);
    }
  })

  var formatDate = function(date) {
    var dayString = ["일","월","화","수","목","금","토"];
    var dateString = (date.getMonth()+1) + "-" + date.getDate();
    dateString += " (" + dayString[date.getDay()] + ") ";
    dateString += date.getHours() + ":" + (date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes());
    return dateString;
  }

  $("span.progress").on("change", function() {
    var progressString = ["수거미처리","수거처리중","배달미처리","배달처리중","완료","취소"];
    $(this).text(progressString[parseInt($(this).text())]);
  });

  $("span.date").on("change", function() {
    var date = new Date($(this).text());
    date.setHours(date.getHours()-date.getTimezoneOffset()/60);
    $(this).text(formatDate(date));
    // $(this).text(date.toISOString());
  });

  var clearOrder = function() {
    $('.control-order').hide();
    $(".order-item").remove();
    $(".order-info span").text('');
  }

  $(".control-order[action='clear']").on("click", function() {
    clearOrder();
  });
  $(".control-order[action='process']").on("click", function() {
    // clearOrder();
    alert("준비중인 기능입니다.");
  });

  var fetchSucess = function (result) {
    $("#search").val('');
    console.log(result);

    $('.control-order').show();

    Object.keys(result).forEach(function(val) {
      $('.order-info span[column='+val+']').text(result[val]);
      $('.order-info span[column='+val+']').change();
    });

    result.items.forEach( function(item){
      var good = $.grep(goods_array, function(e){ return e.code == item.code })[0];
      var itemHtml =
        "<tr class='order-item'>" +
          "<td>" + item.tag + "</td>" +
          "<td>" + good.code + "</td>" +
          "<td>" + good.name + "</td>" +
          "<td>" + good.price + "</td>" +
        "</tr>";
      $(".order-table").append(itemHtml);
    });
  };

  var fetchError = function (error) {
    alert("존재하지 않는 주문번호");
  };

  $("#search").on("keyup",function() {
    var val = $(this).val();
    if( val.length == 8 ) {

      if ( !order_loaded ) {

        $(".order-item").remove();

        $.ajax({
          method : "POST",
          url : "http://localhost/orderbird",
          data : {
            type: "ordersearch_tag",
            tag : val
          },
          success : fetchSucess,
          error : fetchError
        });

        $("#search").val('');

      } else {
        // tag 검색해서 하이라이팅
      }
    }
  });
  $("#search").on("focus", function() {
    // $("#keypad").show();
  });
  $("#keypad input").on("click", function() {
    $("#keypad").hide();
  });
});
