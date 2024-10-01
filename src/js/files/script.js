// Підключення функціоналу "Чертоги Фрілансера"
import { isMobile } from './functions.js'
// Підключення списку активних модулів
import { flsModules } from './modules.js'

const stickyParent = document.querySelectorAll('[data-fixed]')
const stickyEls = document.querySelectorAll('[data-fixed-el]')
const coffee = document.querySelectorAll('[data-coffee]')

coffee.forEach((el, index) => (el.style.animationDelay = `0.${index}s`))

const observerOptions = {
	root: null,
	rootMargin: '0px 0px -100%',
	threshold: 0,
}

const observerCallback = (entries) => {
	entries.forEach((entry) => {
		const el = entry.target
		if (!entry.isIntersecting) {
			stickyEls.forEach((els) => {
				els.style.position = 'absolute'
				// topTable.style.position = 'relative'
			})
		} else {
			stickyEls.forEach((els) => {
				els.style.position = 'fixed'
				// topTable.style.position = 'static'
			})
		}
	})
}

// Создаем наблюдатель
const observer = new IntersectionObserver(observerCallback, observerOptions)

// Наблюдаем за каждым элементом с атрибутом data-fixed
stickyParent.forEach((el) => {
	observer.observe(el)
})
