$(document).on("ready page:load", function () {

  var status = 0;
  var columns = [
    ['name','phone','address'],
    []
  ];

  var column_regex = {
    "phone" : /[0-9-]{9,16}/
  }

  var to_korean = {
    "name" : "이름을",
    "phone" : "전화번호를",
    "address" : "주소를"
  }

  var getFullAddress = function() {
    var full_address = "";
    $("div[column='address'] input").each( function( index,input ) {
      full_address += $(input).val() + " ";
    });
    return full_address.slice(0,-1);
  }

  var validateInputs = function(columns) {

    var validation = true;

    columns.forEach( function(column, index) {
      console.log("input[column='" + column + "']");
      $("input[column='" + column + "']").each( function( index,input ) {
        var text = $(input).val();
        var regex = column_regex[column];
        var match;
        if( undefined != regex ) {
          match = text.match(regex);
          console.log(match);
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

    // return validation;
  }

  $('form').on('submit', function(e) {

    e.preventDefault();

    if ( !validateInputs(columns[status]) ) {
      return false;
    }

    console.log(getFullAddress());

  });

});
