// Підключення функціоналу "Чертоги Фрілансера"
// Підключення списку активних модулів
import { flsModules } from '../modules.js'
// Допоміжні функції
import { isMobile, _slideUp, _slideDown, _slideToggle, FLS } from '../functions.js'
// Модуль прокручування до блоку
import { gotoBlock } from '../scroll/gotoblock.js'
//================================================================================================================================================================================================================================================================================================================================

/*
Документація: https://template.fls.guru/template-docs/rabota-s-formami.html
*/

// Робота із полями форми.

export function formFieldsInit(options = { viewPass: false, autoHeight: false, inputFileValidateProps }) {
	document.body.addEventListener('focusin', function (e) {
		const targetElement = e.target
		if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.add('_form-focus')
				targetElement.parentElement.classList.add('_form-focus')
			}
			formValidate.removeError(targetElement)
			targetElement.hasAttribute('data-validate') ? formValidate.removeError(targetElement) : null
		}
	})
	document.body.addEventListener('focusout', function (e) {
		const targetElement = e.target
		if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
			if (!targetElement.hasAttribute('data-no-focus-classes')) {
				targetElement.classList.remove('_form-focus')
				targetElement.parentElement.classList.remove('_form-focus')
			}
			// Миттєва валідація
			targetElement.hasAttribute('data-validate')
				? formValidate.validateInput(targetElement, options.inputFileValidateProps)
				: null
		}
	})
	// Якщо увімкнено, додаємо функціонал "Показати пароль"
	if (options.viewPass) {
		document.addEventListener('click', function (e) {
			let targetElement = e.target
			if (targetElement.closest('[class*="__viewpass"]')) {
				let inputType = targetElement.classList.contains('_viewpass-active') ? 'password' : 'text'
				targetElement.parentElement.querySelector('input').setAttribute('type', inputType)
				targetElement.classList.toggle('_viewpass-active')
			}
		})
	}
	// Якщо увімкнено, додаємо функціонал "Автовисота"
	if (options.autoHeight) {
		const textareas = document.querySelectorAll('textarea[data-autoheight]')
		if (textareas.length) {
			textareas.forEach((textarea) => {
				const startHeight = textarea.hasAttribute('data-autoheight-min')
					? Number(textarea.dataset.autoheightMin)
					: Number(textarea.offsetHeight)
				const maxHeight = textarea.hasAttribute('data-autoheight-max')
					? Number(textarea.dataset.autoheightMax)
					: Infinity
				setHeight(textarea, Math.min(startHeight, maxHeight))
				textarea.addEventListener('input', () => {
					if (textarea.scrollHeight > startHeight) {
						textarea.style.height = `auto`
						setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight))
					}
				})
			})
			function setHeight(textarea, height) {
				textarea.style.height = `${height}px`
			}
		}
	}
}
// Валідація форм
export let formValidate = {
	getErrors(form, requreProps) {
		let error = 0
		let formRequiredItems = form.querySelectorAll('*[data-required]')
		if (formRequiredItems.length) {
			formRequiredItems.forEach((formRequiredItem) => {
				if (
					(formRequiredItem.offsetParent !== null || formRequiredItem.tagName === 'SELECT') &&
					!formRequiredItem.disabled
				) {
					error += this.validateInput(formRequiredItem, requreProps)
				}
			})
		}
		return error
	},
	validateInput(formRequiredItem, requreProps) {
		let error = 0

		const checkAndHandleError = (hasError, message = null) => {
			if (hasError) {
				this.addError(formRequiredItem, message)
				error++
			} else {
				this.removeError(formRequiredItem)
			}
		}

		const { dataset, type, value, checked } = formRequiredItem

		if (dataset.required === 'email') {
			formRequiredItem.value = formRequiredItem.value.replace(' ', '')
			checkAndHandleError(this.emailTest(formRequiredItem), 'Invalid email')
		} else if (type === 'checkbox') {
			checkAndHandleError(!checked)
		} else if (type === 'tel') {
			const validateMessage = this.phoneNumberTest(formRequiredItem)
			checkAndHandleError(validateMessage, validateMessage)
		} else if (type === 'file') {
			const validateMessage = this.fileTest(formRequiredItem, requreProps)
			checkAndHandleError(validateMessage, validateMessage)
		} else {
			checkAndHandleError(!value.trim(), 'Field is required')
		}

		return error
	},

	addError(formRequiredItem, validateMessage) {
		formRequiredItem.classList.add('_form-error')
		formRequiredItem.parentElement.classList.add('_form-error')
		let inputError = formRequiredItem.parentElement.querySelector('.form__error')
		if (inputError) formRequiredItem.parentElement.removeChild(inputError)
		if (formRequiredItem.dataset.error || validateMessage) {
			formRequiredItem.parentElement.insertAdjacentHTML(
				'beforeend',
				`<div class="form__error">${
					formRequiredItem.dataset.error ? formRequiredItem.dataset.error : validateMessage
				}</div>`
			)
		}
	},
	removeError(formRequiredItem) {
		formRequiredItem.classList.remove('_form-error')
		formRequiredItem.parentElement.classList.remove('_form-error')
		if (formRequiredItem.parentElement.querySelector('.form__error')) {
			formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector('.form__error'))
		}
	},
	formClean(form) {
		form.reset()
		setTimeout(() => {
			let inputs = form.querySelectorAll('input,textarea')
			for (let index = 0; index < inputs.length; index++) {
				const el = inputs[index]
				el.parentElement.classList.remove('_form-focus')
				el.classList.remove('_form-focus')
				formValidate.removeError(el)
			}
			let checkboxes = form.querySelectorAll('.checkbox__input')
			if (checkboxes.length > 0) {
				for (let index = 0; index < checkboxes.length; index++) {
					const checkbox = checkboxes[index]
					checkbox.checked = false
				}
			}
			if (flsModules.select) {
				let selects = form.querySelectorAll('div.select')
				if (selects.length) {
					for (let index = 0; index < selects.length; index++) {
						const select = selects[index].querySelector('select')
						flsModules.select.selectBuild(select)
					}
				}
			}
		}, 0)
	},
	emailTest(formRequiredItem) {
		return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value)
	},

	fileTest(formRequiredItem, requreProps) {
		// Якщо дані для валідації тим чи іншим чином передаються, то автоматично буде валідуватись, в іншому випадку валідація буде проходити тільки на наявність файлу

		const maxSize = formRequiredItem.getAttribute('data-max-size') || requreProps?.maxSize || null
		const allowedTypes = formRequiredItem.getAttribute('data-types')
			? formRequiredItem
					.getAttribute('data-types')
					.split(',')
					.map((type) => type.trim())
			: requreProps?.allowedTypes || []

		if (!formRequiredItem.files || formRequiredItem.files.length === 0) {
			return 'No file selected.'
		}

		for (const file of formRequiredItem.files) {
			if (allowedTypes.length && !allowedTypes.includes(file.type)) {
				const typesString = allowedTypes.map((type) => type.split('/')[1]).join(', ')
				return `Allowed types: ${typesString}`
			}

			if (maxSize && file.size > maxSize * 1024 * 1024) {
				return `Max size is ${maxSize} MB.`
			}
		}
		return null
	},
	phoneNumberTest(formRequiredItem) {
		// Отримуємо значення з атрибутів data-min и data-max, якщо вказані
		const minValue = parseInt(formRequiredItem.getAttribute('data-min')) || 10
		const maxValue = parseInt(formRequiredItem.getAttribute('data-max')) || 15

		// Якщо поле пусте
		if (!formRequiredItem.value.trim()) {
			return 'Enter your phone number'
		}
		// Перевірка на дозволені символи
		if (!/^[+\d\s\-\(\)]+$/.test(formRequiredItem.value)) {
			return 'Only: "digits, spaces, -, (, ), +" '
		}

		// Видаляємо усе окрім цифр
		const cleaned = formRequiredItem.value.replace(/[^\d]/g, '')

		// Перевірки на кількість цифр
		if (cleaned.length < minValue) {
			return `Min ${minValue} digits.`
		}
		if (cleaned.length > maxValue) {
			return `Max ${maxValue} digits.`
		}

		return null
	},
}
/* Відправлення форм */
export function formSubmit(props) {
	const forms = document.forms
	const { TOKEN, CHAT_ID, inputFileValidateProps } = props
	if (forms.length) {
		for (const form of forms) {
			form.addEventListener('submit', (e) => handleFormSubmit(form, e))
			form.addEventListener('reset', (e) => formValidate.formClean(e.target))
		}
	}

	// Функція для відправки даних форми
	async function handleFormSubmit(form, e) {
		const error = !form.hasAttribute('data-no-validate')
			? formValidate.getErrors(form, inputFileValidateProps)
			: 0
		if (error > 0) {
			e.preventDefault()
			scrollToError(form)
			return
		}

		if (form.hasAttribute('data-ajax')) {
			e.preventDefault()
			await handleAjaxSubmit(form)
		} else if (form.hasAttribute('data-dev')) {
			e.preventDefault()
			formSent(form)
		}
	}

	// Функціонал прокручування до елемента з помилкою
	function scrollToError(form) {
		if (form.querySelector('._form-error') && form.hasAttribute('data-goto-error')) {
			const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : '._form-error'
			gotoBlock(formGoToErrorClass, true, 1000)
		}
	}

	// відправка даних за допомогою AJAX
	async function handleAjaxSubmit(form) {
		form.classList.add('_sending', 'ajax-message')

		const isTelegram = form.getAttribute('data-ajax') === 'telegram'
		const statusMessageWrapper = form.querySelector('.form-message-wrapper span') || null
		let statusMessage = statusMessageWrapper && 'Your information has been successfully sent'

		try {
			if (isTelegram) {
				await sendToTelegram(form)
			} else {
				await sendToServer(form)
			}
		} catch (error) {
			statusMessageWrapper ? (statusMessage = error.message) : alert('Error: ' + error.message)
		} finally {
			form.classList.remove('_sending')
			statusMessageWrapper ? (statusMessageWrapper.textContent = statusMessage) : null
			formSent(form)
			setTimeout(() => {
				form.classList.remove('ajax-message')
			}, 4000)
		}
	}

	// Відправка даних на сервер
	async function sendToServer(form) {
		const formAction = form.getAttribute('action')?.trim() || '#'
		const formMethod = form.getAttribute('method')?.trim() || 'GET'
		const formData = new FormData(form)

		const response = await fetch(formAction, {
			method: formMethod,
			body: formData,
		})

		if (response.ok) {
			const responseResult = await response.json()
			formSent(form, responseResult)
		} else {
			throw new Error('Error while sending form data to server')
		}
	}

	// Відправка даних в телеграм
	async function sendToTelegram(form) {
		const URL_API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : ''
		let message = '<b>Request from the website</b>\n\n'
		const fileData = new FormData()
		fileData.append('chat_id', CHAT_ID)
		const mediaData = []
		let fileIndex = 0
		let hasFile = false

		const formData = new FormData(form)
		formData.forEach((value, key) => {
			if (value instanceof File && value.name) {
				hasFile = true
				fileData.append(`file${fileIndex}`, value)
				mediaData.push({ type: 'document', media: `attach://file${fileIndex}` })
				message += `<b>${key}:</b> ${value.name}\n`
				fileIndex++
			} else if (!(value instanceof File)) {
				message += `<b>${key}:</b> ${value}\n`
			}
		})

		await sendMessageToTelegram(URL_API, CHAT_ID, message)

		if (hasFile) {
			fileData.append('media', JSON.stringify(mediaData))
			await sendFilesToTelegram(URL_API, fileData)
		}
	}

	// Відправка текстового повідомлення на основі даних форми в телеграм
	async function sendMessageToTelegram(URL_API, chatId, message) {
		const response = await fetch(`${URL_API}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ chat_id: chatId, parse_mode: 'html', text: message }),
		})

		if (!response.ok) {
			throw new Error('Message send error')
		}
	}

	// Відправка файлів в телеграм
	async function sendFilesToTelegram(URL_API, fileData) {
		const response = await fetch(`${URL_API}/sendMediaGroup`, {
			method: 'POST',
			body: fileData,
		})

		if (!response.ok) {
			throw new Error('File send error')
		}
	}

	// Дії після відправки форми
	function formSent(form, responseResult = '') {
		document.dispatchEvent(new CustomEvent('formSent', { detail: { form: form } }))
		setTimeout(() => {
			if (flsModules.popup) {
				const popup = form.dataset.popupMessage
				if (popup) flsModules.popup.open(popup)
			}
		}, 0)
		formValidate.formClean(form)
		formLogging('Form submitted!')
	}

	function formLogging(message) {
		FLS(`[Forms]: ${message}`)
	}
}

//========================================================================================================================================================

/* Модуль форми "кількість" */
export function formQuantity() {
	document.addEventListener('click', function (e) {
		let targetElement = e.target
		if (targetElement.closest('[data-quantity-plus]') || targetElement.closest('[data-quantity-minus]')) {
			const valueElement = targetElement.closest('[data-quantity]').querySelector('[data-quantity-value]')
			let value = parseInt(valueElement.value)
			if (targetElement.hasAttribute('data-quantity-plus')) {
				value++
				if (+valueElement.dataset.quantityMax && +valueElement.dataset.quantityMax < value) {
					value = valueElement.dataset.quantityMax
				}
			} else {
				--value
				if (+valueElement.dataset.quantityMin) {
					if (+valueElement.dataset.quantityMin > value) {
						value = valueElement.dataset.quantityMin
					}
				} else if (value < 1) {
					value = 1
				}
			}
			targetElement.closest('[data-quantity]').querySelector('[data-quantity-value]').value = value
		}
	})
}

/*
export function formRating() {
	const ratings = document.querySelectorAll('.rating');
	if (ratings.length > 0) {
		initRatings();
	}
	// Основна функція
	function initRatings() {
		let ratingActive, ratingValue;
		// "Бігаємо" по всіх рейтингах на сторінці
		for (let index = 0; index < ratings.length; index++) {
			const rating = ratings[index];
			initRating(rating);
		}
		// Ініціалізуємо конкретний рейтинг
		function initRating(rating) {
			initRatingVars(rating);

			setRatingActiveWidth();

			if (rating.classList.contains('rating_set')) {
				setRating(rating);
			}
		}
		// Ініціалізація змінних
		function initRatingVars(rating) {
			ratingActive = rating.querySelector('.rating__active');
			ratingValue = rating.querySelector('.rating__value');
		}
		// Змінюємо ширину активних зірок
		function setRatingActiveWidth(index = ratingValue.innerHTML) {
			const ratingActiveWidth = index / 0.05;
			ratingActive.style.width = `${ratingActiveWidth}%`;
		}
		// Можливість вказати оцінку
		function setRating(rating) {
			const ratingItems = rating.querySelectorAll('.rating__item');
			for (let index = 0; index < ratingItems.length; index++) {
				const ratingItem = ratingItems[index];
				ratingItem.addEventListener("mouseenter", function (e) {
					// Оновлення змінних
					initRatingVars(rating);
					// Оновлення активних зірок
					setRatingActiveWidth(ratingItem.value);
				});
				ratingItem.addEventListener("mouseleave", function (e) {
					// Оновлення активних зірок
					setRatingActiveWidth();
				});
				ratingItem.addEventListener("click", function (e) {
					// Оновлення змінних
					initRatingVars(rating);

					if (rating.dataset.ajax) {
						// "Надіслати" на сервер
						setRatingValue(ratingItem.value, rating);
					} else {
						// Відобразити вказану оцінку
						ratingValue.innerHTML = index + 1;
						setRatingActiveWidth();
					}
				});
			}
		}
		async function setRatingValue(value, rating) {
			if (!rating.classList.contains('rating_sending')) {
				rating.classList.add('rating_sending');

				// Надсилання даних (value) на сервер
				let response = await fetch('rating.json', {
					method: 'GET',

					//body: JSON.stringify({
					//	userRating: value
					//}),
					//headers: {
					//	'content-type': 'application/json'
					//}

				});
				if (response.ok) {
					const result = await response.json();

					// Отримуємо новий рейтинг
					const newRating = result.newRating;

					// Виведення нового середнього результату
					ratingValue.innerHTML = newRating;

					// Оновлення активних зірок
					setRatingActiveWidth();

					rating.classList.remove('rating_sending');
				} else {
					alert("Помилка");

					rating.classList.remove('rating_sending');
				}
			}
		}
	}
}
*/

/* Модуль зіркового рейтингу */
export function formRating() {
	// Rating
	const ratings = document.querySelectorAll('[data-rating]')
	if (ratings) {
		ratings.forEach((rating) => {
			const ratingValue = +rating.dataset.ratingValue
			const ratingSize = +rating.dataset.ratingSize ? +rating.dataset.ratingSize : 5
			formRatingInit(rating, ratingSize)
			ratingValue ? formRatingSet(rating, ratingValue) : null
			document.addEventListener('click', formRatingAction)
		})
	}
	function formRatingAction(e) {
		const targetElement = e.target
		if (targetElement.closest('.rating__input')) {
			const currentElement = targetElement.closest('.rating__input')
			const ratingValue = +currentElement.value
			const rating = currentElement.closest('.rating')
			const ratingSet = rating.dataset.rating === 'set'
			ratingSet ? formRatingGet(rating, ratingValue) : null
		}
	}
	function formRatingInit(rating, ratingSize) {
		let ratingItems = ``
		for (let index = 0; index < ratingSize; index++) {
			index === 0 ? (ratingItems += `<div class="rating__items">`) : null
			ratingItems += `
				<label class="rating__item">
					<input class="rating__input" type="radio" name="rating" value="${index + 1}">
				</label>`
			index === ratingSize ? (ratingItems += `</div">`) : null
		}
		rating.insertAdjacentHTML('beforeend', ratingItems)
	}
	function formRatingGet(rating, ratingValue) {
		// Тут відправка оцінки (ratingValue) на бекенд...
		// Отримуємо нову седню оцінку formRatingSend()
		// Або виводимо ту яку вказав користувач
		const resultRating = ratingValue
		formRatingSet(rating, resultRating)
	}
	function formRatingSet(rating, value) {
		const ratingItems = rating.querySelectorAll('.rating__item')
		const resultFullItems = parseInt(value)
		const resultPartItem = value - resultFullItems

		rating.hasAttribute('data-rating-title') ? (rating.title = value) : null

		ratingItems.forEach((ratingItem, index) => {
			ratingItem.classList.remove('rating__item--active')
			ratingItem.querySelector('span') ? ratingItems[index].querySelector('span').remove() : null

			if (index <= resultFullItems - 1) {
				ratingItem.classList.add('rating__item--active')
			}
			if (index === resultFullItems && resultPartItem) {
				ratingItem.insertAdjacentHTML('beforeend', `<span style="width:${resultPartItem * 100}%"></span>`)
			}
		})
	}
	function formRatingSend() {}
}

//========================================================================================================================================================
