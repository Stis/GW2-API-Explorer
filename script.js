$(window).on("hashchange", getGuids);

function getGuids() {
  if (!location.hash) {
    return JSON.parse(localStorage.getItem("guids") || "[]");
  }
  var guids = location.hash.slice(1).split(",");
  localStorage.setItem("guids", JSON.stringify(guids));
  history.replaceState(undefined, document.title, location.href.slice(0, location.href.indexOf("#")));
  history.back();
  return guids;
}

$.each(getGuids(), function(i, key) {
  new Api({key:key}).get("Account").then(result => {$("#comptes").append("<input type=\"radio\" name=\"compte\" value=\""+key+"\">"+result.name+"<br>");});
});

$(window).load(function() {
  $("input").change(function() {
    if ($("input[name=compte]:checked") && $("input[name=endpoint]:checked")) {
      $("#dispResult").empty();
      var params = [];
      var ids = {ids: $("#ids").val()};
      var lang = {lang: $(".flag:not(.disab)").attr("lang")};
      if ($("#ids").val() == "") {} else {params = params.concat(ids);}
      if ($(".flag:not(.disab)").length < 0) {} else {params = params.concat(lang);}
      new Api({key:$("input[name=compte]:checked").val()}).get($("input[name=endpoint]:checked").val(),params).then(result => {$("#dispResult").html(syntaxHighlight(result));});}
  });
  $(".flag").click(function() {
    $(".flag:not(.disab)").addClass("disab");
    $(this).removeClass("disab");
  });
});

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