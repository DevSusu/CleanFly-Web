$(document).on("ready page:load", function () {

  // change on production
  var server_ip = "https://cleanfly.link/";

  var columns = ['name','phone','address'];

  var column_regex = {
    "phone" : /[0-9-]{9,16}/
  }

  var to_korean = {
    "name" : "이름을",
    "phone" : "전화번호를",
    "address" : "주소를"
  };

  var form_data = {
    // need phone, name, address, user_code, address able?
  };

  var block_sumbit = true;

  var join_body = {};
  var address_body = { "type" : "address" };

  var getFullAddress = function() {
    var full_address = "";
    $("input[column='address']").each( function( index,input ) {
      full_address += $(input).val() + " ";
    });
    return full_address.slice(0,-1);
  }

  var validateInputs = function(columns) {

    var validation = true;

    columns.forEach( function(column, index) {
      $("input[column='" + column + "']").each( function( index,input ) {
        var text = $(input).val();
        var regex = column_regex[column];
        var match;
        if( undefined != regex ) {
          match = text.match(regex);
        }

        if( text.length == 0 ) {
          validation = false;
          $("p.error[column='" + column + "']").text(to_korean[column] + " 입력해주세요");
        }
        else if ( undefined != regex && null == match ) {
          validation = false;
          $("p.error[column='" + column + "']").text(to_korean[column] + " 형식에 맞게 입력해주세요");
        }
        else {
          $("p.error[column='" + column + "']").text("");
        }

      });

    });

    return validation;
  }

  // fields { user_code, phone, address, is_address_ok }
  var proceed = function(fields) {

    fields.csrfmiddlewaretoken = $('input[name="csrfmiddlewaretoken"]').val();
    console.log(fields);

    var $form = $('#address-form');
    $.each(fields, function(key, val) {
         $('<input>').attr({
             type: "hidden",
             name: key,
             value: val
         }).appendTo($form);
    });
    block_sumbit = false;
    $form.submit();
  };

  var checkAddress = function(callback) {

    var full_address = getFullAddress();
    var address_detail = full_address.split(" ");
    address_body.address = {

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
      data : address_body,
      success : function(result,status) {
        form_data.is_address_ok = result.result;
        callback(form_data);
      },
      error : function(xhr, status, error) {
        form_data.is_address_ok = false;
      }
    });

  }

  var createUser = function(callback) {

    $.ajax({
      url : server_ip + "web/user",
      type : "POST",
      data : join_body,
      success : function(result,status) {
        form_data.user_code = result.user_code;
        callback(proceed);
      },
      error : function(xhr, status, error) {
        alert("정보 등록에 실패했습니다.");
      }
    });

  }

  $('form').on('submit', function(e) {

    if (block_sumbit == true)
    {

      // address api 로 주문 가능지역 확인
      // user 정보 서버에 보내서 새로운 유저인지, 아닌지 판단하고 생성
      // 기존 유저라면 알림창.
      // 다 넘어가면 주문 정보 입력 페이지로

      e.preventDefault();

      if ( !validateInputs(columns) )
        return false;

      join_body.name = $('input[column="name"]').val();
      join_body.phone = $('input[column="phone"]').val().replace(/[- ]/g,'');
      join_body.address = getFullAddress();

      if (confirm(join_body.name + " 고객님\n" + "전화번호 : " + join_body.phone + "\n주소 : " + join_body.address + "\n진행하시겠습니까?") ) {

        $.extend(true, form_data, join_body); // copy data into form_data

        createUser(checkAddress);

      }
    }

  });

});
