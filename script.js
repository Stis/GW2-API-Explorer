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


function getURL(endPoint, key, params) {
    var startURL = "https://api.guildwars2.com/v2/";
    var url = startURL + endPoint + "?1";
    key ? url += "&access_token=" + key : "";
    if (params) {
        params.ids ? url += "&ids=" + params.ids : "";
        params.lang ? url += "&lang=" + params.lang : "";
        params.cid ? url = url.replace(":id", params.cid) : "";
        params.cbo ? url = url.replace(":board", params.cbo) : "";
        params.cre ? url = url.replace(":region", params.cre) : "";
    }
    return url;
}

var guids = JSON.parse(localStorage.getItem("guids") || "[]");
$.each(guids, function(i, key) {
    $.getJSON(getURL("account", key), function(accData) {
        $("#comptes").append("<label><input type=\"radio\" name=\"compte\" value=\""+key+"\">"+accData.name+"</label><br>");
        $.getJSON(getURL("characters", key), function(result) {
            var thediv = $("<persos/>").addClass("hidden");
            $.each(result, function(i, perso) {
                thediv.append("   <label><input type=\"radio\" name=\"perso\" value=\""+perso+"\">"+perso+"</label><br>");
            });
            $("input[value=\""+key+"\"]").parent().next("br").after(thediv);
        }).done(addEv);
    });
});

$(window).on("load", function() {
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
        $(this).siblings().addClass("d");
        $(this).is(":not(.d)") ? $(this).addClass("d") : $(this).removeClass("d");
        getData();
    });
});

function addEv() {
    $("input").change(getData);
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
        cre: $("#cre").val()
    };
    $.getJSON(getURL($("input[name=\"ep\"]:checked").parent().text(), $("input[name=\"compte\"]:checked").val(), params), function(data) {
      $("#content").html($("<pre/>").html(syntaxHighlight(data)));
    });
}