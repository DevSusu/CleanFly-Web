$(document).on('ready page:load', function() {

  // change on production
  var server_ip = "http://localhost/";

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

    $.ajax({
      url : server_ip + "fly/order",
      type : "POST",
      data : request_body,
      success : function(result,status) {
        console.log(result);
      },
      error : function(xhr, status, error) {
        console.log(error);
      }
    });
  };

  $('input.datepicker').on('change input', function() {
    updateDateInput(this);

    if( $(this).attr('column') == 'collection_date' ) {
      var date_string = $(this).val();
      var collection_date = new moment(date_string);

      var interval = 4;
      if( collection_date.day() >=2 ) interval = 5;

      pickerDelivery.setDate( moment(date_string).add(interval,'days').toDate() );

      pickerDelivery.setMinDate( collection_date.add(interval,'days').toDate() );
      pickerDelivery.setMaxDate( moment(date_string).add(interval+7,'days').toDate() );

    } else {

    }
  });

});
