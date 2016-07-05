function receiveMessage(event)
{
  // event.source is popup
  // event.data is "hi there yourself!  the secret response is: rheeeeet!"
  console.log("data from iframe!!!!");
  console.dir(event);
  console.log(event.data);
}

window.addEventListener("message", receiveMessage, false);

$(document).on('ready page:load', function() {

  // TODO
  var inicis_url = "https://inilite.inicis.com/inibill/inibill_card.jsp?p_noti=41080472795309631&price=0&mid=cleanfly01&period=2016062420260624&buyername=1080472795309631&timestamp=20160624183014&returnurl=https%3A%2F%2Fdev.cleanfly.link%2Finipay&goodname=%ED%81%AC%EB%A6%B0%ED%94%8C%EB%9D%BC%EC%9D%B4+%EC%B9%B4%EB%93%9C%EB%93%B1%EB%A1%9D&hashdata=d697536a42bee3e29bc0a578c8d7c25e69eeeeb839e22afbad2ae02f0609c0f4&orderid=cleanfly4";

  $('#frame').attr('src',inicis_url);

  // 암호화된 링크로 요청하여 동의 페이지 얻어오기
  // script 태그는 따로 추가해주기
  // 이용약관 hidden 태그 넣어주기


  // form submit 막기
  // form action 에 따라 다음 것 불러오기

  document.getElementById('frame').contentWindow.showHTML = function(html) {
    console.log(html);
  };

});
