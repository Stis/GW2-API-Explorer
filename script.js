//JSON syntax highlighting. Found this somewhere on stackoverflow
function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

var guids = JSON.parse(localStorage.getItem("guids") || "[]");
var accounts = { undefined: new Api() };
$.each(guids, function(i, key) {
  accounts[key] = new Api({key:key});
  accounts[key].get("account").then(result => {$("#comptes").append("<input type=\"radio\" name=\"compte\" value=\""+key+"\"><label>"+result.name+"</label><br>");});
  // accounts[key].get("characters").then(result => {
  //   var thediv = $("<ul/>").addClass("persos hidden");
  //   $.each(result, function(i, perso) {
  //     thediv.append("<li>     <input type=\"radio\" name=\"perso\" value=\""+perso+"\"><label>"+perso+"</label></li>");
  //   });
  //   $("#comptes").append($("<li/>").append(thediv));
  // });
});

$(window).load(function() {
  if (guids) {
    $.each(guids, function(i, key) {
      $("#keyList").append(key+"\n");
    });
    $("#keyList").html($("#keyList").val().replace(/\n$/, ""));
  }
  $("#saveKeys").click(function() {
    guids = $("#keyList").val().replace("#","").split(/\n| |,/);
    localStorage.setItem("guids", JSON.stringify(guids));
    location.reload(true);
  });
  $("#delKeys").click(function() {
    localStorage.removeItem("guids");
    location.reload();
  });
  $(".flag").click(function() {
    $(this).siblings().addClass("disab");
    $(this).is(":not(.disab)") ? $(this).addClass("disab") : $(this).removeClass("disab");
    getData();
  });
  $("input").change(getData);
  // $("[name=compte] + label").click(function() {
  //   $(".persos").addClass("hidden");
  //   $(this).find("div").removeClass("hidden");
  // });
});

function getData() {
  var params = {};
  if ($("#ids").val() !== "") {params.ids = $("#ids").val();}
  if ($(".flag:not(.disab)").length > 0) {params.lang = $(".flag:not(.disab)").attr("lang");}
  accounts[$("input[name=compte]:checked").val()].get($("input[name=endpoint]:checked").val(),params).then(result => {$("#content").html($("<pre/>").html(syntaxHighlight(result)));});
}