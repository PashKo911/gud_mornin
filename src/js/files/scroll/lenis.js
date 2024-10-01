import { isMobile } from '../functions.js'
import Lenis from '@studio-freight/lenis'

window.onRefreshLenisScroll = () => {
	window.lenis?.destroy()

	setTimeout(() => {
		window.lenis = new Lenis({
			eventsTarget: document.querySelector('main'),
			duration: 1.2,
			infinite: false,
			autoResize: true,
		})
		function raf(time) {
			window.lenis.raf(time)
			requestAnimationFrame(raf)
		}
		requestAnimationFrame(raf)
	}, 0)
}

isMobile.any() ? '' : window.onRefreshLenisScroll()
