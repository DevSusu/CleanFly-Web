var confirmOnPageExit = function (e)
{
    // If we haven't been passed the event get the window.event
    e = e || window.event;

    var message = '결제가 진행중입니다. 정말로 나가시겠습니까?';

    // For IE6-8 and Firefox prior to version 4
    if (e)
    {
        e.returnValue = message;
    }

    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
};

window.onbeforeunload = confirmOnPageExit;

var cardComplete = function(info,confirm) {
  ga('send', 'event', 'card', 'register');
  info.find('h5').text("주문이 완료되었습니다");
  info.find('p').first().text(
    moment(confirm.collection_date).utcOffset(0).format('M월 D일 H시') +
    "에 배달원이 방문합니다");
  info.append( $('<p>시간 변경 및 취소는 1800-7098 또는 카카오톡 @크린플라이로 알려주세요</p>'));

  $('#card-list').remove();
  $('#frame').remove();
  $('#frame-top').remove();
}

function receiveMessage(event)
{
  var server_ip = "https://cleanfly.link/";
  console.log("data from iframe!!!!");
  // {"resultcode":"00","cardcd":"06","cardno":"467309019042"}

  $('#frame').remove();

  var result = JSON.parse(event.data);
  var info = $('#card-info');
  if( result.resultcode == "00" ) {
    ga('send', 'event', 'card', 'create');

    var order_code = window.location.pathname.split('/')[1];
    result.order_code = order_code;

    $.ajax({
      url : server_ip + "web/order/confirm",
      type : "POST",
      data : result,
      success : function(confirm,status) {
        console.log(confirm);
        cardComplete(info,confirm);
      },
      error : function(xhr, status, error) {
        alert("주문 활성화에 실패했습니다.\n1800-7098 또는 카카오톡 @크린플라이로 문의해주세요");
        alert("메인 페이지로 이동합니다");
        window.location.pathname = "/";
      }
    });

  } else {
    info.find('h5').text("카드 등록에 실패했습니다");
    info.find('p').text("계좌 잔액이나 분실 상태를 확인해주세요");
  }
}

window.addEventListener("message", receiveMessage, false);

$(document).on('ready page:load', function() {

  ga('send', 'event', 'card-page', 'view');

  var cd_to_ko = {
    "01" : "외한",
    "03" : "롯데",
    "04" : "현대",
    "06" : "국민",
    "11" : "BC",
    "12" : "삼성",
    "14" : "신한",
    "15" : "한미",
    "16" : "NH농협",
    "17" : "하나SK",
    "21" : "비자",
    "22" : "마스터",
    "23" : "JCB",
    "24" : "아멕스",
    "25" : "다이너스",
    "" : "카드"
  };

  var registerCard = function(e) {
    var card_info = {
      card_code : $(e.target).parent().find('p[name="code"]').text(),
      order_code : window.location.pathname.split('/')[1]
    };
    $.ajax({
      url : server_ip + "web/order/confirm",
      type : "POST",
      data : card_info,
      success : function(confirm,status) {
        console.log(confirm);
        cardComplete($('#card-info'),confirm);
      },
      error : function(xhr, status, error) {
        alert("주문 활성화에 실패했습니다.\n1800-7098 또는 카카오톡 @크린플라이로 문의해주세요");
        alert("메인 페이지로 이동합니다");
        window.location.pathname = "/";
      }
    });
  };

  $('#frame').hide();
  $('#frame-top').hide();
  $('#card-list').hide();

  var server_ip = "https://cleanfly.link/";
  var inicis_url = "https://inilite.inicis.com/inibill/inibill_card.jsp?";
  var params = {

    price : 0,
    returnurl : "https://dev.cleanfly.link/inipay",
    goodname : "크린플라이 카드등록",
    orderid : "cleanfly4",
    mid : "cleanfly01",
    timestamp : moment().format('YYYYMMDDHHmmss'),
    period : moment().format('YYYYMMDD') + moment('2026',['YYYY']).format('YYYYMMDD')

  };

  params.phash = window.location.pathname.split('/')[2];
  // params.order_code = $('input[name="order-code"]').val();
  params.order_code = window.location.pathname.split('/')[1];

  if( undefined != params.phash ) {

    $.ajax({
      url : server_ip + "web/auth",
      type : "POST",
      data : params,
      success : function(result,status) {
        console.log(result);
        if( result.type === "auth" ) { // 아직 카드가 등록되지 않은 주문

          if( result.card_count != 0 ) { // 카드를 등록한적 있는 유저
            $('#card-list').show();
            result.cards.forEach( function(card,index) {

              var item_row =
              $('<div class="row card-item">' +
                '<div class="twelve columns u-center-align">' +
                  '<p class="hide" name="code"></p>' +
                  '<p class="three-sm" name="cardcd"></p>' +
                  '<p class="six-sm" name="cardno"></p>' +
                  '<button class="button highlight three-sm" name="card">사용</button>' +
                '</div>' +
              '</div>');
              item_row.on('click', registerCard);
              $('#card-list').append(item_row);
              var item = $('#card-list > .card-item').last();
              item.find('p[name="code"]').text(card.code);
              item.find('p[name="cardcd"]').text(cd_to_ko[card.cardcd]);
              item.find('p[name="cardno"]').text(
                card.cardno.slice(0,4) + " " +
                card.cardno.slice(4,8) + " " +
                card.cardno.slice(8,12) + " ****");

            });
          }

          inicis_url += $.param(result.params);
          $('#frame-top').show();
          $('#frame').attr('src',inicis_url);
          $('#frame').show();

        } else if( result.type === "valid") { // 이미 카드가 등록된 경우
          var info = $('#card-info');
          info.find('h5').text("주문이 완료되었습니다");
          info.find('p').first().text(
            moment(result.order.collection_date,'YYYY-MM-DD HH:mm:ss').tz('Asia/Seoul').format('M월 D일 H시') +
            "에 배달원이 방문합니다");
          info.append( $('<p>수거/배달 시간 변경 및 취소는 1800-7098 또는 카카오톡 @크린플라이로 알려주세요</p>'));

        }
      },
      error : function(xhr, status, error) {
        alert("잘못된 결제 url 입니다.");
      }
    });

  } else {
    alert("올바른 url이 아닙니다");
    window.location.pathname = "/"; // redirection
  }

});
