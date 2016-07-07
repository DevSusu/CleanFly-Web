function receiveMessage(event)
{
  console.log("data from iframe!!!!");
  // {"resultcode":"00","cardcd":"06","cardno":"467309019042"}

  $('#frame').remove();

  var result = JSON.parse(event.data);
  var info = $('#card-info');
  if( result.resultcode == "00" ) {
    info.find('h5').text("카드가 등록되었습니다");
    info.find('p').text("?월?일 ?시에 배달원이 방문합니다");
    ////* 수거/배달 시간 변경 및 취소는 1800-7098 또는 카카오톡 @크린플라이로 알려주세요
  } else {
    info.find('h5').text("카드 등록에 실패했습니다");
    info.find('p').text("계좌 잔액이나 분실 상태를 확인해주세요");
  }
}

window.addEventListener("message", receiveMessage, false);

$(document).on('ready page:load', function() {

  var server_ip = "https://localhost/";
  var inicis_url = "https://inilite.inicis.com/inibill/inibill_card.jsp?";
  var user_id = "web100000001"; // example
  var user_type = 5;
  var params = {

    price : 0,
    returnurl : "https://dev.cleanfly.link/inipay",
    goodname : "크린플라이 카드등록",
    orderid : "cleanfly4",
    mid : "cleanfly01",
    timestamp : moment().format('YYYYMMDDHHmmss'),
    period : moment().format('YYYYMMDD') + moment('2026',['YYYY'])

  };
  params.buyername = user_id;
  params.p_noti = user_type + user_id;

  $.ajax({
    url : server_ip + "web/inipay",
    type : "POST",
    data : params,
    success : function(result,status) {
      params.hashdata = result;
      inicis_url += $.param(params);
      $('#frame').attr('src',inicis_url);
    },
    error : function(xhr, status, error) {
      alert("결제 정보를 받아오지 못했습니다.");
    }
  });

});
