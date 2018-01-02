var socket = io();
var aNewUser={};
var prevOnlineList=[];

$('#login-modal .btn-submit.login').click(function(){
  var nickName = $('input').val();
  aNewUser['nickName'] = nickName;
  socket.emit('login',aNewUser);
  $('#login-page').toggle();
  $('#hangout').toggle();
  // $('#hangout #head.style-bg h1').html(nickName);
  setName(nickName);
});

socket.on('allOnlineUsers',function (currentList) {
  var pos = currentList.indexOf(aNewUser.nickName);
  currentList.splice(pos,1);
  updateOnlineList(prevOnlineList,currentList);
  prevOnlineList = currentList;
  // $.each(onlineList,function(i,userName){
  //   $location.append('<li><img src="http://lorempixel.com/100/100/people/1/"><div class="content-container"><span class="name">'+userName +'</span><span class="txt">Online</span></div><span class="time">'+(new Date)+'</span></li>');
  // });
  //
});

// going to paticular chat
var openChat = [];
$(document).on('click','.list-text > ul > li',function(){
var chatTo = $(this).find('.name').text();
if(openChat.indexOf(chatTo) == -1){
  $('#content').append('<div class="list-chat" id="'+chatTo+'"><ul class="chat"></ul><div class="meta-bar chat"><div class="txt-box-size"><input class="nostyle chat-input" type="text" placeholder="Message..." /></div><div class="btn-box-size"><input type="button" class="btn-submit send" value="send"></div></div></div>');
  openChat.push(chatTo);
}

// $(document).find('.list-chat').each(function(i,v){
//   if(chatTo == $(v).attr('id'))
//   console.log(chatTo + "already present");
//   else {
//     $('#content').append('<div class="list-chat" id="'+chatTo+'"><ul class="chat"></ul><div class="meta-bar chat"><input class="nostyle chat-input" type="text" placeholder="Message..." /> <i class="mdi mdi-send"></i></div></div>')
//   }
// });
// $('ul.chat > li').eq(1).html('<img src="' + $(this).find('img').prop('src') + '"><div class="message"><p>' + $(this).find('.txt').text() + '</p></div>');
// console.log("cool");

// timeout just for eyecandy...
setTimeout(function() {
  $('.shown').removeClass('shown');
  $('.list-chat#'+chatTo).addClass('shown');
  $('#hangout #head h1').text(chatTo);
  setRoute('.list-chat');
  $('.chat-input').focus();
}, 300);
});


$(document).on('click','.btn-submit.send', function() {
  var from = aNewUser.nickName;
  var to = $(this).closest('.list-chat').attr('id');
  var message = $('#'+to+' .chat-input').val();
  var $chatmessage = '<p>' + message + '</p>';
  var data = {
    'from' : from,
    'to' : to,
    'message' : message
  };
  socket.emit('clientMssgServer',data);
  $('#'+to+' ul.chat').append('<li><div class="message message-sent">'+$chatmessage+'</div></li>');
  $('#'+to+' .chat-input').val('');
  $('.chat-input').focus();
});

socket.on('serverMssgClient',function(data){
  // console.log(data);
  var message = data.message;
  var from = data.from;
  var $chatmessage = '<p>' + message + '</p>';
  if(openChat.indexOf(from) == -1){
    $('#content').append('<div class="list-chat" id="'+from+'"><ul class="chat"><li><div class="message">'+$chatmessage+'</div></li></ul><div class="meta-bar chat"><div class="txt-box-size"><input class="nostyle chat-input" type="text" placeholder="Message..." /></div><div class="btn-box-size"><input type="button" class="btn-submit send" value="send"></div></div></div>');
    openChat.push(from);
  }
  else {
    var ul_chat = '.list-chat#' + from + ' ul.chat'
    $(ul_chat).append('<li><div class="message">'+$chatmessage+'</div></li>');
  }

  setTimeout(function() {
    $('.shown').removeClass('shown');
    $('.list-chat#' + from).addClass('shown');
    $('#hangout #head h1').text(from);
    setRoute('.list-chat');
    $('.chat-input').focus();
  }, 300);

});

var updateOnlineList = function (prevList,currentList) {
  if(prevList.length > currentList.length){
    var leftList = myFilter(currentList,prevList);
    removeUser(leftList);
  }
  if(prevList.length < currentList.length){
    var joinedList = myFilter(prevList,currentList)
    showRecentlyJoinedUser(joinedList);
  }
}

var myFilter = function(firstList,secondList){ //firstsmaller
  return secondList.filter(function (anElement) {
    var pos = firstList.indexOf(anElement);
    return pos == -1;
  });
}

var removeUser = function (leftList) {
  var $location = $('.list-text > ul');
  $.each(leftList,function(i,userName){
    $location.find('.name').each(function (i,v) {
      if(userName == $(v).text())$(v).parent().parent().remove();
    });
  });
}

var showRecentlyJoinedUser = function (joinedList) {
  var $location = $('.list-text > ul');
  $.each(joinedList,function(i,userName){
    $location.append('<li><img src="http://lorempixel.com/100/100/people/1/"><div class="content-container"><span class="name">'+userName +'</span><span class="txt">Online</span></div><span class="time">'+(new Date)+'</span></li>');
  });
}
