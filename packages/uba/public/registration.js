$(document).ready(function () {
    var frm = $('#registration-form');
    frm.validator();

    var $core = new UB.Core({
        host: window.location.origin,
        path: '/',
    });

    $core.initialize().then(function($core){
        if ($core.connection.domain.has('utm_campaign')) {
            UB.Repository('utm_campaign')
                .attrs(['code', 'name', 'sourceRequired', 'sourceLabel'])
                .selectAsObject().then(function (data) {
                    var cmpSelect = $('#utm_campaign');
                    $.each(data, function (i, item) {
                        var params = {
                            value: item.code,
                            text : item.name
                        };
                        if (item.sourceLabel){
                            params['data-sourcelabel'] = item.sourceLabel;
                        }
                        cmpSelect.append($('<option>', params));
                    });
                    cmpSelect.prop('disabled', false );
                });
        }
    }).done();

    $('#utm_campaign').on('change', function() {
        var sourceLabel = $(this).find(':selected').data('sourcelabel');
        if (sourceLabel){
            $('#utm_source').prop('placeholder', sourceLabel);
            $("#utm_source_group").removeClass('hidden');
        } else {
            $("#utm_source_group").addClass('hidden');
        }
    });

    frm.on('submit', function (e) {
        if (grecaptcha.getResponse() === ''){
            e.preventDefault();
            var alertText = "Please, confirm you are not a robot";
            $('#registration-form').find('.messages').html('<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                alertText + '</div>');
            return;
        }
        if (!e.isDefaultPrevented()) {
            frm.find('.messages').html('');
            $.ajax({
                type: 'POST',
                url: 'rest/uba_user/publicRegistration',
                contentType: "application/json; charset=utf-8",
                dataType   : "json",
                data: JSON.stringify({
                    email: $(this).find('#email').val(),
                    phone: $(this).find('#phone').val(),
                    utmCampaign: $(this).find('#utm_campaign').val(),
                    utmSource: $(this).find('#utm_source').val(),
                    recaptca: grecaptcha.getResponse()
                })
            }).done(function(data){
                console.log(data);
                var alertBox = '<div class="alert alert-success" role="alert"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                    data.message + '</div>';
                //frm[0].reset();
                //frm.find('.messages').html(alertBox);
                frm.html(alertBox);
            }).fail(function(reason){
                console.error(reason);
                var alertText;
                var abortRe = /^UBAbort: /;
                if (reason && reason.responseJSON && abortRe.test(reason.responseJSON.errMsg)){
                    var inErr = reason.responseJSON.errMsg;
                    inErr = /^UBAbort: <<<(.*)>>>$/.test(inErr) ? /^UBAbort: <<<(.*)>>>$/.exec(inErr)[1] : /^UBAbort: (.*)$/.exec(inErr)[1];
                    if (inErr === 'Duplicate user name (may be in different case)') {
                        alertText = 'Member with such EMail is already registered. If you forgot your password, please go to the "Member Area" and select "Need help?" option'
                    } else {
                        alertText = inErr;
                    }
                } else {
                    alertText = 'Error during processing your request. Please, try again later of <a href="contacts.html">contact us</a>'
                }
                var alertBox = '<div class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                    alertText + '</div>';
                //frm[0].reset();
                frm.find('.messages').html(alertBox);
                grecaptcha.reset();
            });
            return false;
        }
    })
});