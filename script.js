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


function getURL(eP, key, params) {
  var url = "https://api.guildwars2.com"+eP+"?1";
  key ? url += "&access_token="+key : "";
  if (params) {
    params.ids ? url += "&ids=" + params.ids : "";
    params.lang ? url += "&lang=" + params.lang : "";
    params.cid ? url = url.replace(":id", params.cid) : "";
    params.cbo ? url = url.replace(":board", params.cbo) : "";
    params.cre ? url = url.replace(":region", params.cre) : "";
    params.cgi ? url = url.replace(":guild_id", params.cgi) : "";
    params.cte ? url = url.replace(":team", params.cte) : "";
  }
  return url;
}

var guids = JSON.parse(localStorage.getItem("guids") || "[]");
$.each(guids, function(i, key) {
  $.getJSON(getURL("/v2/account", key), function(accData) {
    $("#comptes").append("<label><input type=\"radio\" name=\"compte\" value=\""+key+"\">"+accData.name+"</label><br>");
    $.getJSON(getURL("/v2/characters", key), function(result) {
      var thediv = $("<persos/>").addClass("hidden");
      $.each(result, function(i, perso) {
        thediv.append("<label><input type=\"radio\" name=\"perso\" value=\""+perso+"\">"+perso+"</label><br>");
      });
      $("input[value=\""+key+"\"]").parent().next("br").after(thediv);
    }).done(addEv);
  });
});

$.getJSON("https://api.guildwars2.com/v2.json", function(data) {
  $.each(data.routes, function(i, ep) {
    var ald = ep.lang === true ? "l" : "";
    ald += ep.auth === true ? " a" : "";
    ald += ep.active === true ? "" : " d";
    $("#eps").append($("<label/>", {class: ald, text: ep.path}).prepend($("<input/>", {type: "radio", name: "ep"})), $("<br/>"));
  });
}).done(addEv);

$(window).on("load", function() {
  if (guids) {
    $.each(guids, function() {
      $("#keyList").append(this+"\n");
    });
    $("#keyList").html($("#keyList").val().replace(/\n$/, ""));
  }
  $("#saveKeys").click(function() {
    localStorage.setItem("guids", JSON.stringify($("#keyList").val().split(/\n| |,/)));
  });
  $("#delKeys").click(function() {
    localStorage.removeItem("guids");
    $("#keyList").empty();
  });
  $(".flag").click(function() {
    $(this).siblings().addClass("d");
    $(this).is(":not(.d)") ? $(this).addClass("d") : $(this).removeClass("d");
    getData();
  });
});

function addEv() {
  $("input").off();
  $("input").change(getData);
  $("label").off();
  $("input[name=\"compte\"]").parent().click(function() {
    $("input[name=\"perso\"]").prop("checked",false);
    $("persos").addClass("hidden");
    $(this).next().next("persos").removeClass("hidden");
  });
}

function getData() {
  var params = {
    lang: $(".flag:not(.d)").attr("lang"),
    ids: $("#ids").val(),
    cid: $("input[name=\"perso\"]").is(":checked") ? $("input[name=\"perso\"]:checked").val() : $("#cid").val(),
    cbo: $("#cbo").val(),
    cre: $("#cre").val(),
    cgi: $("#cgi").val(),
    cte: $("#cte").val()
  };
  $.getJSON(getURL($("input[name=\"ep\"]:checked").parent().text(), $("input[name=\"compte\"]:checked").val(), params), function(data) {
    $("#content").html($("<pre/>").html(syntaxHighlight(data)));
  }).fail(function(data, err) {
    $("#content").html($("<pre/>").html(syntaxHighlight(data.responseText)));
  });
}
