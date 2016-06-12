$(document).ready(function(){
	var pub_passwd = "",
	api_base = "https://dm.tuna.moe",
	channel = "tuna",
	danmaku_api_url_pub = api_base + "/api/v1/channels/" + channel + "/danmaku",
	danmaku_api_url_sub = api_base + "/api/v1.1/channels/" + channel + "/danmaku",
	sub_id = "browser-" + Math.floor(Math.random() * 100000);

	var video = $("#video-container"),
	dm_overlay = $("#danmaku-overlay"),
	dm_container = $("#danmaku-container"),
	container_height = 0; 

	var init_container_size = function() {
		dm_overlay.offset({top: video.offset().top, left: 0}); 
		dm_overlay.height(playerheight + "px"); 
		dm_container.width($(window).width() + "px"); 
		container_height = dm_overlay.height();

		var n = Math.floor(container_height/40);
		dm_container.empty();
		for (i = 1; i <= n; i++) {
			var id = "slot-" + i;
			dm_container.append(
					"<div class='dm-slot empty' id='" + id +"'></div>" 
					);
		}
	};
	
	init_container_size();

	$('form').submit(function() {

		var data = JSON.stringify({
			content: $("#danmaku").val(),
			position: $("#position-selection input:checked").val(),
			color: $("#color-selection input:checked").val()
		});

		$.ajax({
			type: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-GDANMAKU-AUTH-KEY": pub_passwd,
				"X-GDANMAKU-TOKEN": "APP:live"
			},
			url: danmaku_api_url_pub, 
			data: data,
			success: function(){ $("#danmaku").val(""); },
			statusCode: {
				403: function() {
					show_error("密码有误，请刷新重设！");
				} 
			}
		});

		return false; 
	});

	var dm_id = 0;

	var getDanmaku = function() {
		$.ajax({
			type: 'GET',
			headers: {
				"X-GDANMAKU-AUTH-KEY": "",
				"X-GDANMAKU-SUBSCRIBER-ID": sub_id
			},
			url: danmaku_api_url_sub,
			success: function(data) {
				if (data.length > 0) {
					$(data).each(function(i, e){
						var dm = $("<div />")
							.addClass("danmaku")
							.addClass(e.style)
							.text(e.text);

						if (e.position == "fly") {
							dm.addClass("fly");
							dm_container.append(dm);
							dm.css({
								top: Math.random() * container_height * 0.9 + 10 + 'px'
							});
							
							dm.animate(
									{left: '-' + dm.width() + 'px'}, 
									10000, 
									'linear',
									function(){dm.remove();}
							);

						} else if (e.position == "top") {
							var empty_slot = $($(".dm-slot.empty")[0]);
							empty_slot.removeClass('empty');
							empty_slot.append(dm);
							window.setTimeout(function(){
								empty_slot.addClass('empty').text('');
							}, 10000);
						} else if (e.position == 'bottom') {
							var empty_slots = $(".dm-slot.empty");
							var empty_slot = $(empty_slots[empty_slots.length-1]);

							empty_slot.removeClass('empty');
							empty_slot.append(dm);
							window.setTimeout(function(){
								empty_slot.addClass('empty').text('');
							}, 10000);

						}
					});
				}
				getDanmaku();
			}
		}); 
	};
	getDanmaku();
});
