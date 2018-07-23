var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$.ajax({
    method: "GET",
    url: "/setup/env",
}).done(env => {
    Object.keys(env).forEach(k => {
        const input = $(`input[name='${k}']`);
        if (input.length > 0) {
            if (input.prop('type') === 'text') {
                if (k === 'HITCHHIKER_APP_HOST') {
                    let port = env[k].substr(env[k].lastIndexOf(':') + 1).replace('/', '');
                    const host = env[k].substr(0, env[k].lastIndexOf(':')).replace(/^http[s]?:\/\//, '');
                    if (!(/^[0-9]*$/.test(port))) {
                        port = '';
                    }
                    input.val(host);
                    $("input[name=Port]").val(port);
                } else {
                    input.val(env[k]);
                }
            } else if (input.prop('type') === 'checkbox') {
                input.prop('checked', env[k] === '1' ? true : false);
            }
        } else {
            const select = $(`select[name='${k}']`);
            select.val(env[k]);
        }
    });
    onMailTypeSelect(env['HITCHHIKER_MAIL_CUSTOM']);
    onHostChange();
    onDBChange();
});

$(".next ").click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //activate next step on progressbar using the index of next_fs
    $("#progressbar li ").eq($("fieldset ").index(next_fs)).addClass("active ");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate({
        opacity: 0
    }, {
        step: function (now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now "
            //1. scale current_fs down to 80%
            scale = 1 - (1 - now) * 0.2;
            //2. bring next_fs from the right(50%)
            left = (now * 50) + "% ";
            //3. increase opacity of next_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({
                'transform': 'scale(' + scale + ')',
                'position': 'absolute'
            });
            next_fs.css({
                'left': left,
                'opacity': opacity
            });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});

$(".previous ").click(function () {
    if (animating) return false;
    animating = true;

    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //de-activate current step on progressbar
    $("#progressbar li ").eq($("fieldset ").index(current_fs)).removeClass("active ");

    //show the previous fieldset
    previous_fs.show();
    //hide the current fieldset with style
    current_fs.animate({
        opacity: 0
    }, {
        step: function (now, mx) {
            //as the opacity of current_fs reduces to 0 - stored in "now "
            //1. scale previous_fs from 80% to 100%
            scale = 0.8 + (1 - now) * 0.2;
            //2. take current_fs to the right(50%) - from 0%
            left = ((1 - now) * 50) + "% ";
            //3. increase opacity of previous_fs to 1 as it moves in
            opacity = 1 - now;
            current_fs.css({
                'left': left
            });
            previous_fs.css({
                'transform': 'scale(' + scale + ')',
                'opacity': opacity
            });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        //this comes from the custom easing plugin
        easing: 'easeInOutBack'
    });
});

$("#submit").click(function () {
    $("#submit").prop("disabled", true);
    $("#log").prop("hidden", false);
    $("#log").html("Working...");
    var formData = $("#msform").serializeArray();
    var postData = {};
    formData.forEach(f => postData[f.name] = f.value);
    postData['HITCHHIKER_APP_HOST'] = `${postData['HITCHHIKER_APP_HOST']}:${postData['Port']}`;
    if (!/^http[s]?:\/\//.test(postData['HITCHHIKER_APP_HOST'])) {
        postData['HITCHHIKER_APP_HOST'] = `http://${postData['HITCHHIKER_APP_HOST']}`;
    }
    if (!postData['HITCHHIKER_APP_HOST'].endsWith('/')) {
        postData['HITCHHIKER_APP_HOST'] = `${postData['HITCHHIKER_APP_HOST']}/`;
    }
    postData['HITCHHIKER_MAIL_SMTP_TLS'] = postData['HITCHHIKER_MAIL_SMTP_TLS'] === "on" ? "1" : "0";
    postData['HITCHHIKER_MAIL_SMTP_RU'] = postData['HITCHHIKER_MAIL_SMTP_RU'] === "on" ? "1" : "0";
    postData['HITCHHIKER_SYNC_ONOFF'] = postData['HITCHHIKER_SYNC_ONOFF'] === "on" ? "1" : "0";
    Reflect.deleteProperty(postData, "Port");
    console.log(postData);
    $.ajax({
        method: "POST",
        url: "/setup/env",
        data: postData,
    }).done(msg => {
        $("#log").html("Done, wait 5 seconds.");
        console.log(msg);
        const url = postData['HITCHHIKER_APP_HOST'];
        setTimeout(() => {
            $("#log").html("Redirecting");
            location.href = url;
        }, 5000);
    });
});

function onHostChange() {
    var couldNext = couldGoNext('HITCHHIKER_APP_HOST', 'Port');
    $("#host-next").prop("disabled", !couldNext);
}

function onDBChange() {
    var couldNext = couldGoNext('HITCHHIKER_DB_HOST', 'HITCHHIKER_DB_PORT', 'MYSQL_DATABASE', 'HITCHHIKER_DB_USERNAME', 'MYSQL_ROOT_PASSWORD');
    $("#db-next").prop("disabled", !couldNext);
}

function couldGoNext() {
    return [...arguments].every(a => !!$(`input[name='${a}']`).val());
}

function onMailTypeSelect(type) {
    if (type === "none") {
        $(".mail-api").css("display", "none");
        $(".mail-smtp").css("display", "none");
    } else if (type === "api") {
        $(".mail-api").css("display", "inline");
        $(".mail-smtp").css("display", "none");
    } else if (type === "smtp") {
        $(".mail-api").css("display", "none");
        $(".mail-smtp").css("display", "inline");
    }
}