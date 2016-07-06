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

        if( option.attr('selected') ) {
          option.attr('selected',false);
          option.next().attr('selected',true);
        }
        option.attr('disabled',true);
        option.text(option.text() + " 마감" );
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

    select.find('option').first().attr('selected',true);

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

    // TODO
    // fetch time from server and disable select option values
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

  $('textarea[placeholder*="\n"]').each(function(){

          // Store placeholder elsewhere and blank it
          $(this).attr('data-placeholder', $(this).attr('placeholder'));
          $(this).attr('placeholder', '');

          // On focus, if value = placeholder, blank it
          $(this).focus(function(e){
                  if( $(this).val() == $(this).attr('data-placeholder') ) {
                          $(this).attr('value', '');
                          $(this).removeClass('placeholder');
                  }
          });

          // On blur, if value = blank, insert placeholder
          $(this).blur(function(e){
                  if( $(this).text() == '' ) {
                          $(this).text($(this).attr('data-placeholder'));
                          $(this).addClass('placeholder');
                  }
          });

          // Call blur method to preset element - this will insert the placeholder
          // if the value hasn't been prepopulated
          $(this).blur();
  });

});
