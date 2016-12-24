var confirmOnPageExit = function (e)
{
    // If we haven't been passed the event get the window.event
    e = e || window.event;

    var message = '주문 정보를 작성중입니다. 정말로 나가시겠습니까?';

    // For IE6-8 and Firefox prior to version 4
    if (e)
    {
        e.returnValue = message;
    }

    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
};

window.onbeforeunload = confirmOnPageExit;

$(document).on('ready page:load', function() {

  ga('send', 'event', 'order-page', 'view');

  // change on production
  var server_ip = "https://cleanfly.link/";

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

  var current_time_option = {
    "collection" : $('select[column="collection"]').children('option:selected'),
    "delivery" : $('select[column="delivery"]').children('option:selected')
  };
  var collection_min_date = moment();
  var max_collection_time = 23;

  if( collection_min_date.day() == 0 || collection_min_date.day() == 6 ) {
    // 주말엔 6시까지
    max_collection_time = 17;
  }

  if( collection_min_date.hour() > max_collection_time ) {
    collection_min_date.add(1,'d');
  }

  var isHoliday = function(date) {
    date = new moment(date);
    var holiday_start = new moment('2016-10-03',"YYYY-MM-DD").tz('Asia/Seoul');
    var holiday_end   = new moment('2016-10-04',"YYYY-MM-DD").tz('Asia/Seoul');
    if( date.diff(holiday_start, 'minutes') >= 0 && holiday_end.diff(date, 'minutes') > 0  ) {
      return true;
    }
    return false;
  }

  var pickerCollection = new Pikaday({
    field: $('.datepicker')[0],
    i18n: i18n,
    minDate: collection_min_date.toDate(),
    maxDate: moment().add(7,'d').toDate(),
    defaultDate: moment().toDate(),
    disableDayFn: isHoliday,
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
    disableDayFn: isHoliday,
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

  var addDate = function(type) {
    if( type == "collection_date" ) {
      var input = pickerCollection.getDate();
      pickerCollection.setDate( input.setDate(input.getDate() + 1) );
    } else {
      var input = pickerDelivery.getDate();
      pickerDelivery.setDate( input.setDate(input.getDate() + 1) );
    }
  }

  var moveSelected = function(type) {
    var select = $('select[column="' + type + '"]');
    var current_option = current_time_option[type];
    var min_diff = 24;
    var min_option;
    var min_val = "";
    var min_index;

    select.children('option[disabled!="disabled"]').each( function(index, option) {
      var tmp_diff = Math.abs(parseInt($(option).val().slice(0,2)) - parseInt($(current_option).val().slice(0,2)));
      if ( min_diff > tmp_diff ) {
        min_index = index;
        min_diff = tmp_diff;
        min_val = $(option).val();
      }

    });

    select.children('option[selected]').each( function(index,option) {
      $(option).removeAttr('selected');
    });
    select.children('option:eq('+ min_index +')').attr('selected','selected');
    select.val(min_val);
    current_time_option[type] = select.children('option[value="'+min_val+'"]');
  }

  var updateFullDate = function(input) {
    var type = $(input).attr('column').slice(0,-5);
    var input_moment = new moment( $(input).val() ).startOf('day');
    var select = $('select[column="' + type + '"]');

    full.forEach( function(full_item,index) {
      var full_date = new moment(full_item.slice(0,full_item.indexOf(" ")),"yyyy-M-D").startOf('day');

      if( input_moment.diff( full_date ) == 0 ) {
        var full_time = full_item.slice(full_item.indexOf(" ")+1,-2) + "0"; // ㅅㅂ..
        var option = select.children('option[value="' + full_time +  '"]');

        if( option.text().indexOf(" ") == -1 ) {
          option.attr('disabled',true);
          option.text(option.text() + " 마감");
        }
      }
      if ( index == full.length - 1 ) {
        if ( select.children('option[disabled="disabled"]').length == 14 ) {
          if ( $(input).attr('column') === "collection_date" ) {
            pickerCollection.setMoment(input_moment.add(1,'days'));
          } else {
            pickerDelivery.setMoment(input_moment.add(1,'days'));
          }
          updateDateInput(input);
        } else {
          moveSelected(type);
        }
      }
    });
  }

  var updateDateInput = function(input) {
    var type = $(input).attr('column').slice(0,-5);
    var val = $(input).val();
    var input_moment = new moment( $(input).val().slice(0,-4),["YYYY-M-D"] );
    var day = val.slice(-3);

    if( to_ko[day] )
      val = val.slice(0,-3) + to_ko[day];

    $(input).val(val);

    var select = $('select[column="' + type + '"]');

    if( input_moment.day() == 0 || input_moment.day() == 6 ) {
      max_collection_time = 17;
    } else {
      max_collection_time = 23;
    }

    // 지금+2시간보다 이전 시간 비활성화 , 배달 시간보다 늦은 것 비활성화
    select.find('option').each( function(index, option) {

      $(option).attr('disabled',false);
      if( $(option).text().indexOf(" ") != -1 ) {
        $(option).text( $(option).text().slice(0,-3) );
      }

      if( moment().diff( moment( $(input).val().slice(0,-4) + " " + $(option).val(), ["YYYY-M-D HH:mm"] ), 'hours' ) > -1 ) {
        $(option).attr('disabled',true);
      }

      if( parseInt($(option).val()) > max_collection_time ) {
        $(option).attr('disabled',true);
      }
    });
    //moveSelected(type);
    // 마감 체크
    updateFullDate(input);

  };

  var adjustDate = function(input) {

    if( $(input).attr('column') == 'collection_date' ) {
      var date_string = $(input).val().slice(0,-4);
      var collection_moment = new moment(date_string,"YYYY-MM-DD").tz('Asia/Seoul');

      var interval = 4;
      if( collection_moment.day() > 2 ) interval = 5;

      var delivery_min_date = collection_moment.add(interval,'days');

      var holiday_start = new moment('2016-12-25',"YYYY-MM-DD").tz('Asia/Seoul');
      var holiday_end   = new moment('2016-12-26',"YYYY-MM-DD").tz('Asia/Seoul');

      var current_moment = new moment(date_string,"YYYY-MM-DD").tz('Asia/Seoul');

      // 수거 시간이 휴가 전, 배달 시간이 휴가 시작일 이후
      if( current_moment.diff(holiday_start,'days') < 0 && holiday_start.diff(delivery_min_date,'days') <= 0 ) {
        delivery_min_date = delivery_min_date.add(1,'days');
        interval += 1;
        if( collection_moment.day() > 2 ) interval--;
      }
      // 수거 시간이 휴가 일 이내에 있을 때
      else if ( current_moment.diff(holiday_start,'days') >= 0 && current_moment.diff(holiday_end,'days') < 0 ) {
        pickerCollection.setMinDate( new moment('2016-12-26',"YYYY-MM-DD").tz('Asia/Seoul').toDate() );
        pickerCollection.setMaxDate( new moment('2016-12-26',"YYYY-MM-DD").tz('Asia/Seoul').add(7,'days').toDate() );
        pickerCollection.setDate( holiday_end.toDate() );
        delivery_min_date = new moment('2016-12-26',"YYYY-MM-DD").tz('Asia/Seoul').add(4,'days').toDate();
        interval = 0;
      }

      pickerDelivery.setMinDate( delivery_min_date.toDate() );
      // 만약 지금 배달 시간이 4박 5일 이내에 있거나 너무 멀리 있을때만 다시 조정.
      if ( pickerDelivery.getDate() < delivery_min_date.toDate() )
        pickerDelivery.setDate( delivery_min_date.toDate() );

      var delivery_max_date = new moment(date_string,"YYYY-MM-DD").tz('Asia/Seoul').add(interval+7,'days');
      pickerDelivery.setMaxDate( delivery_max_date.toDate() );
      if ( pickerDelivery.getDate() > delivery_max_date.toDate() )
        pickerDelivery.setDate( delivery_max_date.toDate() );

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
      request_body.start_date = pickerCollection.getMoment().add('4','days').format('YYYY-M-D HH:mm:ss');
      request_body.end_date = pickerCollection.getMoment().add('12','days').format('YYYY-M-D HH:mm:ss');
    }

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
  $('input.datepicker').each( function(index, input) {
    adjustDate(this);
    updateDateInput(input, fetchTime( index == 0 ? "collection" : "delivery" ));
  });

  $('input.datepicker').on('change input', function() {

    // 0. 영어로 된 요일 한글로 바꿔주기 ok
    // 1. 원래 선택됐었던 '시간' 저장 ok
    // 2. full 인 시간 비활성화 ok
    // 3. 현재시간+2시간 보다 이전인 시간 비활성화 ok
    // 4. 주말에는 18시 이후 비활성화 ok
    // 5. 원래 선택한 시간이 비활성화 됐다면 가장 가까운 시간 찾아주기
    // 6. 전부 다 비활성화 된 경우 다음날로 바꾸고 다시 2부터 반복
    adjustDate(this);
    updateDateInput(this);
  });

  $('select').on('change', function() {
    console.log('time changed');
    var select = $(this);
    var option = select.children('option[value="'+select.val()+'"]');
    current_time_option[select.attr('column')] = option;
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
      window.onbeforeunload = false;
      ga('send', 'event', 'order-form', 'submit');
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

      if( $('textarea').hasClass('placeholder') ) order_data.notices = "";

      console.log(order_data);

      $.ajax({
        url : server_ip + "web/order",
        type : "POST",
        data : order_data,
        success : function(result,status) {
          console.log(result);
          alert("주문이 접수되었습니다\n* 모바일로 결제 메세지가 전송됩니다");
          block_sumbit = false;
          if( $('textarea').hasClass('placeholder') ) $('textarea').val('');
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
