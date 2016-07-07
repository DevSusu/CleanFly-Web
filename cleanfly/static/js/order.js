$(document).on('ready page:load', function() {

  // change on production
  var server_ip = "https://localhost/";

  var full = [];

  var to_ko = {
    'Sun' : "일요일",
    'Mon' : "월요일",
    'Tue' : "화요일",
    'Wed' : "수요일",
    'Thu' : "목요일",
    'Fri' : "금요일",
    'Sat' : "토요일",
  };

  var i18n = {
    previousMonth : '지난달',
    nextMonth     : '다음달',
    months        : ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
    weekdays      : ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
    weekdaysShort : ['일','월','화','수','목','금','토']
  };

  var pickerCollection = new Pikaday({
    field: $('.datepicker')[0],
    i18n: i18n,
    minDate: moment().toDate(),
    maxDate: moment().add(7,'d').toDate(),
    defaultDate: moment().toDate(),
    numberOfMonths: 1,
    setDefaultDate: true,
    reposition: false,
    format: 'YYYY-MM-DD ddd'
  });

  var pickerDelivery = new Pikaday({
    field: $('.datepicker')[1],
    i18n: i18n,
    minDate: moment().add(4,'d').toDate(),
    maxDate: moment().add(7+4,'d').toDate(),
    defaultDate: moment().toDate(),
    numberOfMonths: 1,
    setDefaultDate: true,
    format: 'YYYY-MM-DD ddd'
  });

  var getFullAddress = function() {
    var full_address = "";
    $("input[column='address']").each( function( index,input ) {
      full_address += $(input).val() + " ";
    });
    return full_address.slice(0,-1);
  }

  var updateFullDate = function(input) {
    var input_moment = new moment( $(input).val() ).startOf('day');
    var select = $(input).next();

    full.forEach( function(full_item,index) {
      var full_date = new moment(full_item.slice(0,full_item.indexOf(" ")),"yyyy-M-D").startOf('day');

      if( input_moment.diff( full_date ) == 0 ) {
        var full_time = full_item.slice(full_item.indexOf(" ")+1,-2) + "0"; // ㅅㅂ..
        var option = select.find('option[value="' + full_time +  '"]');

        if( undefined != option.attr('selected') ) {
          option.attr('selected',false);
          option.next().attr('selected',true);
        }
        option.attr('disabled',true);
        option.text(option.text() + " 마감");
      }

    });
  }

  var updateDateInput = function(input) {
    var val = $(input).val();
    var day = val.slice(-3);
    val = val.slice(0,-3) + to_ko[day];
    $(input).val(val);

    var select = $(input).next();
    console.dir(select);

    // 마감 다 없애기
    select.find('option').each( function(index, option) {
      var tmp = $(option).text().indexOf(" ");
      if( tmp != -1 ){
        $(option).text( $(option).text().slice(0,tmp) );
        $(option).attr('disabled',false);
      }
      $(option).attr('selected',false);
    });

    updateFullDate(input);

  };

  var adjustDate = function(input) {

    if( $(input).attr('column') == 'collection_date' ) {
      var date_string = $(input).val();
      var collection_moment = new moment(date_string);

      var interval = 4;
      if( collection_moment.day() >=2 ) interval = 5;

      var delivery_min_date = collection_moment.add(interval,'days').toDate();
      pickerDelivery.setMinDate( delivery_min_date );
      // 만약 지금 배달 시간이 4박 5일 이내에 있거나 너무 멀리 있을때만 다시 조정.
      if ( pickerDelivery.getDate() < delivery_min_date )
        pickerDelivery.setDate( delivery_min_date );

      var delivery_max_date = new moment(date_string).add(interval + 7,'days').toDate();
      pickerDelivery.setMaxDate( delivery_max_date );
      if ( pickerDelivery.getDate() > delivery_max_date )
        pickerDelivery.setDate( delivery_max_date );

    } else {

    }

  }

  var fetchTime = function(type) { // type = collection or delivery

    var request_body = {
      "type" : type
    };
    var full_address = getFullAddress();
    var address_detail = full_address.split(" ");
    request_body.address = {

      "admin_area" : address_detail[0],
      "locality" : address_detail[1]+" "+address_detail[2],
      "thoroughfare" : address_detail[3],
      "full_address" : full_address,
      "latitude" : 0.0,
      "longitude" : 0.0

    };
    if( type == "delivery" ) {
      request_body.start_date = pickerCollection.getMoment().add('5','days').format('YYYY-M-D HH:mm:ss');
      request_body.end_date = pickerCollection.getMoment().add('12','days').format('YYYY-M-D HH:mm:ss');
    }

    console.log("request body");
    console.dir(request_body);

    $.ajax({
      url : server_ip + "fly/order",
      type : "POST",
      data : request_body,
      success : function(result,status) {
        console.log(result);
        result.result.full.forEach( function(value) {
          full.push(value);
        });
        updateFullDate($('input.datepicker')[ type=="collection" ? 0 : 1 ]);
        $('input[name="address_code"]').val(result.result.address_code);
      },
      error : function(xhr, status, error) {
        // alert();
        console.log(error);
      }
    });
  };

  // initial update
  $('input.datepicker').each( function(index, value) {
    updateDateInput(value, fetchTime( index == 0 ? "collection" : "delivery" ));
  });

  $('input.datepicker').on('change input', function() {
    updateDateInput(this);
    adjustDate(this);
  });

  $('textarea').each(function(){
    $(this).attr('data-placeholder', $(this).attr('placeholder'));
    $(this).attr('placeholder', '');

    $(this).focus(function(e){
      if( $(this).val() == $(this).attr('data-placeholder') ) {
        $(this).val('');
        $(this).removeClass('placeholder');
      }
    });

    $(this).blur(function(e){
      if( $(this).val().length == 0 ) {
        $(this).val($(this).attr('data-placeholder'));
        $(this).addClass('placeholder');
      }
    });

    $(this).blur();
  });

  // TODO
  // Form submit 막고 api 호출하기
  // 가격표랑 배달비(만원 이하 주문) 텍스트, 알림 넣기
  // view 순서 수정하기? /order 없애기랄까
  var block_sumbit = true;

  $('#order-form').on('submit', function(e) {

    if( block_sumbit ) {
      e.preventDefault();
    } else {
      return;
    }

    var confirm_str =
      "수거시간 : " + $('input.datepicker').first().val() + "\n" +
      "배달시간 : " + $('input.datepicker').last().val() + "\n" +
      "으로 주문하시겠습니까?";

    if ( confirm(confirm_str) ) {

      var order_data = {
        "collection_date" :
          pickerCollection.getMoment().format('YYYY-M-D ') +
          $('select[name="collection_time"]').val(),

        "delivery_date" :
          pickerDelivery.getMoment().format('YYYY-M-D ') +
          $('select[name="delivery_time"]').val(),

        "notices" : $('textarea[name="notices"]').val(),
        "id" : $('input[name="id"]').val(),
        "user_code" : $('input[name="user_code"]').val(),
        "phone" : $('input[name="phone"]').val(),
        "address" : $('input[name="address"]').val(),
        "address_code" : $('input[name="address_code"]').val()
      };

      console.log(order_data);

      $.ajax({
        url : server_ip + "web/order",
        type : "POST",
        data : order_data,
        success : function(result,status) {
          console.log(result);
          alert("주문이 접수되었습니다\n* 모바일로 결제 링크가 전송됩니다");
          block_sumbit = false;
          $('#order-form').submit();
        },
        error : function(xhr, status, error) {
          console.log(xhr);
          alert("주문 등록에 실패했습니다.");
        }
      });
    }

  });

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

});
