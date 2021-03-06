//payment.js
// payment-confirm
var payment = {
	error: function(msg){
		$("#payment-errors").text(msg);
	},
	init: (function(){
		$("#payment-confirm").on(ui.click, function(e) {
			
			g.lock();
			var response = {};
			var ccNum = $('#card-number').val(),
				cvcNum = $('#card-cvc').val(),
				expMonth = $('#card-month').val(),
				expYear = 20 + $('#card-year').val(),
				error = false;
			// Validate the number:
			if (!Stripe.validateCardNumber(ccNum)) {
				error = true;
				g.msg('The credit card number is invalid.');
			}
			// Validate the CVC:
			if (!Stripe.validateCVC(cvcNum)) {
				error = true;
				g.msg('The CVC number is invalid.');
			}
			// Validate the expiration:
			if (!Stripe.validateExpiry(expMonth, expYear)) {
				error = true;
				g.msg('The expiration date is invalid.');
			}
			if (!error) {
				$('#payment-errors').text('');
				Stripe.createToken({
					number: ccNum,
					cvc: cvcNum,
					exp_month: expMonth,
					exp_year: expYear
				}, stripeResponseHandler);
			} else {
				g.unlock();
			}
			
			function stripeResponseHandler(status, response){
				if (response.error) {
					console.info("ERROR!");
					g.msg(response.error.message);
					g.unlock();
				} else {
					// No errors, submit the form.
					g.msg("Communicating with the server...");
					$.ajax({
						url: app.url + "php/purchaseFw.php",
						data: {
							stripeToken: response.id
						}
					}).done(function(data) {
						g.msg("Thank you for your purchase!<br>Firmament Wars - Complete Game Unlocked!", 8);
						setTimeout(function(){
							location.reload();
						}, 3000);
					}).fail(function(data) {
						document.getElementById('payment-errors').textContent = data.error;
					}).always(function(){
						g.unlock();
					});
				}
			}
		});
	})()
};