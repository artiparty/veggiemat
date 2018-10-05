(function() {
	var exercisesSubscription = document.querySelector('.connect__main');

	if (exercisesSubscription) {
		var exercisesSubscriptionHandler = debounce(function() {
			var bounding = exercisesSubscription.getBoundingClientRect();
			var subscriptionSticky = document.querySelector('.js-flying-thing');

			if (
				bounding.top >= 0 &&
				bounding.bottom - 60 <=
					(window.innerHeight || document.documentElement.clientHeight)
			) {
				subscriptionSticky.classList.add('flying-thing--hidden');
			} else {
				subscriptionSticky.classList.remove('flying-thing--hidden');
			}
		}, 250);

		window.addEventListener('scroll', exercisesSubscriptionHandler);
	}

	function debounce(func, wait, immediate) {
		var timeout;

		return function() {
			var context = this;
			var args = arguments;
			var later = function() {
				timeout = null;

				if (!immediate) {
					func.apply(context, args);
				}
			};
			var callNow = immediate && !timeout;

			clearTimeout(timeout);

			timeout = setTimeout(later, wait);

			if (callNow) {
				func.apply(context, args);
			}
		};
	}
})();

