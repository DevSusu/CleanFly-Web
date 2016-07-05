$(document).on('ready page:load', function() {

  // change on production
  var server_ip = "https://localhost/";

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

  var updateDateInput = function(input) {
    var val = $(input).val();
    var day = val.slice(-3);
    val = val.slice(0,-3) + to_ko[day];
    $(input).val(val);
  }

  var adjustDate = function(input) {

    if( $(input).attr('column') == 'collection_date' ) {
      var date_string = $(input).val();
      var collection_moment = new moment(date_string);
      var collection_date = collection_moment.add(interval,'days').toDate();
      var collection_date_end = collection_moment.add(7,'days').toDate();

      var interval = 4;
      if( collection_moment.day() >=2 ) interval = 5;

      // 만약 지금 배달 시간이 4박 5일 이내에 있거나 너무 멀리 있을때만 다시 조정.
      if ( pickerDelivery.getDate() < collection_date )
        pickerDelivery.setDate( collection_date );
      else if ( pickerDelivery.getDate() > collection_date_end )
        pickerDelivery.setDate( collection_date_end );

      pickerDelivery.setMinDate( collection_date );
      pickerDelivery.setMaxDate( moment(date_string).add(interval+7,'days').toDate() );

      fetchTime("collection");

    } else {

    }

  }

  // initial update
  $('input.datepicker').each( function( index, value) {
    updateDateInput(value);
  });

  var getFullAddress = function() {
    var full_address = "";
    $("input[column='address']").each( function( index,input ) {
      full_address += $(input).val() + " ";
    });
    return full_address.slice(0,-1);
  }

  var fetchTime = function(type) { // type = collection or delivery

    // TODO
    // fetch time from server and disable select option values
    var request_body = {
      "type" : type
    };
    var full_address = getFullAddress();
    var address_detail = full_address.split(" ");
    request_body.address = full_address;
    request_body.adderss_code = $('input[name="address_code"]').val();

    console.log(request_body);

    $.ajax({
      url : server_ip + "web/order",
      type : "POST",
      data : request_body,
      success : function(result,status) {
        // TODO disable select values
        console.log(result);
      },
      error : function(xhr, status, error) {
        // alert();
        console.log(error);
      }
    });
  };

  $('input.datepicker').on('change input', function() {
    updateDateInput(this);
    adjustDate(this);
  });

});
