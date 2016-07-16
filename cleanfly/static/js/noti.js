$(document).on('ready page:load',function() {

  ga('send', 'event', 'noti-page', 'view');

  // change on production
  var server_ip = "https://cleanfly.link/";

  $('#register-noti').on('submit',function(e) {
    e.preventDefault();

    ga('send', 'event', 'noti', 'register');

    $.ajax({
      url : server_ip + "web/user/notification",
      type : "POST",
      data : { "user_code" : $('input[name="user_code"]').val() },
      success : function(result,status) {
        if ( confirm("알림 등록이 완료되었습니다. 메인 페이지로 이동하시겠습니까?") ) {
          window.location.href = "http://www.getcleanfly.com/";
        }
      },
      error : function(xhr, status, error) {
        alert("알림 등록에 실패했습니다");
      }
    });

  });

});
