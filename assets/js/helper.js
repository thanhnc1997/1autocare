function create_element(e) {
	let div = document.createElement(e);
	return div;
}

const api_end_point = {
	products: 'product',
	articles: 'post',
	login: 'auth/login',
	logout: 'auth/logout',
	profile: 'profile',
	contract: 'contract',
	province: 'province',
	car_purpose: 'category-intended-use',
	sale_history: 'lich-su-ban-hang',
	revenue: 'doanh-thu',
	payment: 'payment',
	register: 'auth/register',
	sale_agent: 'sale-agent'
}

// const bhdt_api = 'https://portal.bhdt.vn/api/';
const bhdt_api = 'https://portal-dev.bhdt.vn/api/';
const bhtd_main = 'https://bhdt.vn/api/';

const url_callback = bhtd_main + api_end_point.payment + '/payment-callback';
// const url_callback = 'https://beta.bhdt.vn/api/payment/payment-callback';

async function toast(params) {
	let div = create_element('div');
	div.classList.add('toast', params.type);
	div.innerHTML = params.message;
	document.body.appendChild(div);
	
	setTimeout(() => {
		document.querySelector('.toast').remove();
	}, 2500);
}

async function loader() {
  let div = create_element('div');
  div.classList.add('lds-ring');
  div.innerHTML = `
  <div></div>
  <div></div>
  <div></div>
  `;
  document.body.appendChild(div);
}

async function remove_loader() {
	if (document.querySelector('.lds-ring')) {
		document.querySelector('.lds-ring').remove();
	}
	
	if (document.querySelector('.lazy-load')) {
		document.querySelector('.lazy-load').remove();
	}
}

async function fetch_data(params) {
	let {method, url, callback, body, auth, api_key, content_type, show_message} = params;
	try {
		const response = await fetch(url, {
			method: method,
			body: JSON.stringify(body),
			headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
				apiKey: api_key
      }
		});
		
		const data = await response.json();
		if (show_message && show_message == true) {
			if (data.code == 0) {
				toast({
					message: render_icon.circle_warning({
						width: 14,
						height: 14,
						fill: '#721c24',
						stroke_width: 1.5
					}) + data.message,
					type: 'danger'
				});
				return false;
			}

			if (data.code == 1) {
				toast({
					message: render_icon.circle_success({
						width: 16,
						height: 16,
						fill: '#155724',
						stroke_width: 1.5
					}) + data.message,
					type: 'success'
				});
			}
		}
		
		if (callback) {
			await callback(data);
		}
	}
	catch(error) {
		console.log(error);
		remove_loader();
	}
}

async function fetch_form_data(params) {
	let {method, url, callback, body, auth, api_key} = params;
	try {
		const response = await fetch(url, {
			method: method,
			body: body,
			headers: {
        Authorization: auth,
				apiKey: api_key
      }
		});
		const data = await response.json();
		if (data.code == 0) {
			toast({
				message: render_icon.circle_warning({
					width: 14,
					height: 14,
					fill: '#721c24',
					stroke_width: 1.5
				}) + data.message,
				type: 'danger'
			});
			return false;
		}
		
		if (data.code == 1) {
			if (data.code == 1) {
				toast({
					message: render_icon.circle_success({
						width: 16,
						height: 16,
						fill: '#155724',
						stroke_width: 1.5
					}) + data.message,
					type: 'success'
				});
			}
		}
		
		if (callback) {
			await callback(data);
		}
	}
	catch(error) {
		console.log(error);
		remove_loader();
	}
}

let render_icon = {
	arrow_left(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M1 6.5L6 11.5M1 6.5L6 1.5M1 6.5L19 6.5" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	arrow_right(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 20 13" fill ="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M19 6.5L14 1.5M19 6.5L14 11.5M19 6.5H1" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	arrow_up_tilt_right(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M17 1H8.11158M17 1L16.9995 9.88889M17 1L1 17" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	chevron_left(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 6 11"  fill ="none"fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M5 9.5L1 5.5L5 1.5" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	chevron_right(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 7 11" fill ="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M1.5 1.5L5.5 5.5L1.5 9.5" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	chevron_down(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M9 1.25873L5 5.25873L1 1.25873" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	marker(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 10 11" fill ="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M1 4.40103C1 7.13503 3.39176 9.39594 4.45042 10.2628C4.60193 10.3868 4.67859 10.4496 4.79163 10.4814C4.87965 10.5062 5.00919 10.5062 5.09721 10.4814C5.21046 10.4495 5.28658 10.3874 5.43867 10.2628C6.49732 9.39602 8.88896 7.13528 8.88896 4.40128C8.88896 3.36663 8.4734 2.37423 7.73366 1.64262C6.99393 0.911014 5.99069 0.5 4.94455 0.5C3.8984 0.5 2.89506 0.911075 2.15532 1.64268C1.41558 2.37429 1 3.36638 1 4.40103Z" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M3.8175 3.881C3.8175 4.50343 4.32208 5.008 4.9445 5.008C5.56693 5.008 6.0715 4.50343 6.0715 3.881C6.0715 3.25858 5.56693 2.754 4.9445 2.754C4.32208 2.754 3.8175 3.25858 3.8175 3.881Z" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	envelope(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 15 11" fill ="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M1.60326 1.21429L5.96586 4.50876L5.96732 4.50997C6.45173 4.8652 6.69408 5.04293 6.95952 5.11158C7.19414 5.17227 7.44077 5.17227 7.67539 5.11158C7.94107 5.04287 8.18412 4.86462 8.66939 4.50876C8.66939 4.50876 11.4676 2.36139 13.0318 1.21429M0.888977 8.21443V2.78585C0.888977 1.98578 0.888977 1.58544 1.04468 1.27985C1.18164 1.01105 1.40003 0.792667 1.66883 0.655705C1.97442 0.5 2.37476 0.5 3.17483 0.5H11.4605C12.2606 0.5 12.6601 0.5 12.9657 0.655705C13.2345 0.792667 13.4536 1.01105 13.5906 1.27985C13.7461 1.58514 13.7461 1.985 13.7461 2.78351V8.21684C13.7461 9.01535 13.7461 9.41463 13.5906 9.71992C13.4536 9.98872 13.2345 10.2075 12.9657 10.3444C12.6604 10.5 12.2611 10.5 11.4626 10.5H3.17248C2.37397 10.5 1.97412 10.5 1.66883 10.3444C1.40003 10.2075 1.18164 9.98872 1.04468 9.71992C0.888977 9.41433 0.888977 9.0145 0.888977 8.21443Z" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	phone(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 12 11" fill ="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M4.35861 1.19846C4.18987 0.776612 3.7813 0.5 3.32696 0.5H1.79876C1.2174 0.5 0.746124 0.971165 0.746124 1.55252C0.746124 6.49402 4.75212 10.5 9.69361 10.5C10.275 10.5 10.7461 10.0287 10.7461 9.44733L10.7464 7.91887C10.7464 7.46453 10.4698 7.05604 10.048 6.8873L8.58331 6.30164C8.20439 6.15007 7.77296 6.21828 7.45943 6.47955L7.08142 6.79483C6.63994 7.16272 5.99037 7.13346 5.58401 6.72711L4.51958 5.6617C4.11323 5.25535 4.0832 4.6063 4.4511 4.16483L4.76631 3.78683C5.02758 3.47331 5.0964 3.04176 4.94483 2.66283L4.35861 1.19846Z" stroke="${params.fill || ''}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	hamburger(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 17 13" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M1.5 11.5H15.5M1.5 6.5H15.5M1.5 1.5H15.5" stroke="${params.fill || '0'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	trash(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M11 8.5V15.5M7 8.5V15.5M3 4.5V16.3C3 17.4201 3 17.9798 3.21799 18.4076C3.40973 18.7839 3.71547 19.0905 4.0918 19.2822C4.5192 19.5 5.07899 19.5 6.19691 19.5H11.8031C12.921 19.5 13.48 19.5 13.9074 19.2822C14.2837 19.0905 14.5905 18.7839 14.7822 18.4076C15 17.9802 15 17.421 15 16.3031V4.5M3 4.5H5M3 4.5H1M5 4.5H13M5 4.5C5 3.56812 5 3.10241 5.15224 2.73486C5.35523 2.24481 5.74432 1.85523 6.23438 1.65224C6.60192 1.5 7.06812 1.5 8 1.5H10C10.9319 1.5 11.3978 1.5 11.7654 1.65224C12.2554 1.85523 12.6447 2.24481 12.8477 2.73486C12.9999 3.1024 13 3.56812 13 4.5M13 4.5H15M15 4.5H17" stroke="${params.fill || '0'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	plus(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M1.5 8.5H8.5M8.5 8.5H15.5M8.5 8.5V15.5M8.5 8.5V1.5" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`
	},
	file_upload(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8 16V10M8 10L5 12M8 10L11 12M9 1.00087C8.90451 1 8.79728 1 8.67471 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40973 1.40973 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002V15.8002C1 16.9203 1 17.4801 1.21799 17.9079C1.40973 18.2842 1.71547 18.5905 2.0918 18.7822C2.51921 19 3.079 19 4.19694 19L11.8031 19C12.921 19 13.48 19 13.9074 18.7822C14.2837 18.5905 14.5905 18.2842 14.7822 17.9079C15 17.4805 15 16.9215 15 15.8036V7.32568C15 7.20296 15 7.09561 14.9991 7M9 1.00087C9.28564 1.00347 9.46634 1.01385 9.63884 1.05526C9.84291 1.10425 10.0379 1.18526 10.2168 1.29492C10.4186 1.41857 10.5918 1.59182 10.9375 1.9375L14.063 5.06298C14.4089 5.40889 14.5809 5.58136 14.7046 5.78319C14.8142 5.96214 14.8953 6.15726 14.9443 6.36133C14.9857 6.53376 14.9963 6.71451 14.9991 7M9 1.00087V3.8C9 4.9201 9 5.47977 9.21799 5.90759C9.40973 6.28392 9.71547 6.59048 10.0918 6.78223C10.5192 7 11.079 7 12.1969 7H14.9991M14.9991 7H15.0002" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	file_download(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8 10V16M8 16L11 14M8 16L5 14M9 1.00087C8.90451 1 8.79728 1 8.67471 1H4.2002C3.08009 1 2.51962 1 2.0918 1.21799C1.71547 1.40973 1.40973 1.71547 1.21799 2.0918C1 2.51962 1 3.08009 1 4.2002V15.8002C1 16.9203 1 17.4801 1.21799 17.9079C1.40973 18.2842 1.71547 18.5905 2.0918 18.7822C2.5192 19 3.07899 19 4.19691 19H11.8031C12.921 19 13.48 19 13.9074 18.7822C14.2837 18.5905 14.5905 18.2842 14.7822 17.9079C15 17.4805 15 16.9215 15 15.8036V7.32568C15 7.20296 15 7.09561 14.9991 7M9 1.00087C9.28564 1.00347 9.46634 1.01385 9.63884 1.05526C9.84291 1.10425 10.0379 1.18526 10.2168 1.29492C10.4186 1.41857 10.5918 1.59182 10.9375 1.9375L14.063 5.06298C14.4089 5.40889 14.5809 5.58136 14.7046 5.78319C14.8142 5.96214 14.8953 6.15726 14.9443 6.36133C14.9857 6.53376 14.9963 6.71451 14.9991 7M9 1.00087V3.8C9 4.9201 9 5.47977 9.21799 5.90759C9.40973 6.28392 9.71547 6.59048 10.0918 6.78223C10.5192 7 11.079 7 12.1969 7H14.9991M14.9991 7H15.0002" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	times(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M13 13.4999L7.00002 7.49999M7.00002 7.49999L1 1.49997M7.00002 7.49999L13 1.49997M7.00002 7.49999L1 13.5" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	show(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2.5868 8.77881C4.36623 10.5478 7.46953 12.9999 11.0002 12.9999C14.5308 12.9999 17.6335 10.5478 19.413 8.77881C19.8823 8.31226 20.1177 8.07819 20.2671 7.62012C20.3738 7.29328 20.3738 6.70674 20.2671 6.3799C20.1177 5.92181 19.8823 5.6877 19.413 5.22111C17.6335 3.45208 14.5308 1 11.0002 1C7.46953 1 4.36623 3.45208 2.5868 5.22111C2.11714 5.68802 1.88229 5.92165 1.7328 6.3799C1.62618 6.70673 1.62618 7.29328 1.7328 7.62012C1.88229 8.07837 2.11714 8.31189 2.5868 8.77881Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M9 7C9 8.10457 9.89543 9 11 9C12.1046 9 13 8.10457 13 7C13 5.89543 12.1046 5 11 5C9.89543 5 9 5.89543 9 7Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	hide(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2.99989 1L18.9999 17M15.4999 13.7559C14.1473 14.4845 12.6185 14.9999 10.9999 14.9999C7.46924 14.9999 4.36624 12.5478 2.5868 10.7788C2.1171 10.3119 1.88229 10.0784 1.7328 9.62012C1.62619 9.29328 1.62616 8.70657 1.7328 8.37974C1.88233 7.92147 2.11763 7.68745 2.58827 7.21967C3.48515 6.32821 4.71801 5.26359 6.17219 4.42676M18.4999 11.6335C18.8329 11.3405 19.138 11.0523 19.4117 10.7803L19.4146 10.7772C19.8832 10.3114 20.1182 10.0779 20.2674 9.62061C20.374 9.29378 20.3738 8.70684 20.2672 8.38C20.1178 7.92187 19.8827 7.68775 19.4133 7.22111C17.6338 5.45208 14.5305 3 10.9999 3C10.6624 3 10.3288 3.02241 9.99989 3.06448M12.3228 10.5C11.9702 10.8112 11.5071 11 10.9999 11C9.89532 11 8.99989 10.1046 8.99989 9C8.99989 8.4605 9.21351 7.97108 9.56077 7.61133" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	circle_warning(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M10 6.4502V10.4502M10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19ZM10.0498 13.4502V13.5502L9.9502 13.5498V13.4502H10.0498Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	circle_success(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15 10L11 14L9 12M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	dots_h(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M13 2C13 2.55228 13.4477 3 14 3C14.5523 3 15 2.55228 15 2C15 1.44772 14.5523 1 14 1C13.4477 1 13 1.44772 13 2Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linejoin="round"/>
		<path d="M7 2C7 2.55228 7.44772 3 8 3C8.55228 3 9 2.55228 9 2C9 1.44772 8.55228 1 8 1C7.44772 1 7 1.44772 7 2Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		<path d="M1 2C1 2.55228 1.44772 3 2 3C2.55228 3 3 2.55228 3 2C3 1.44772 2.55228 1 2 1C1.44772 1 1 1.44772 1 2Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	edit(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7.0002 3H4.2002C3.08009 3 2.51962 3 2.0918 3.21799C1.71547 3.40973 1.40973 3.71547 1.21799 4.0918C1 4.51962 1 5.08009 1 6.2002V15.8002C1 16.9203 1 17.4801 1.21799 17.9079C1.40973 18.2842 1.71547 18.5905 2.0918 18.7822C2.5192 19 3.07899 19 4.19691 19H13.8031C14.921 19 15.48 19 15.9074 18.7822C16.2837 18.5905 16.5905 18.2839 16.7822 17.9076C17 17.4802 17 16.921 17 15.8031V13M13 4L7 10V13H10L16 7M13 4L16 1L19 4L16 7M13 4L16 7" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	},
	search(params) {
		return `
		<svg width="${params.width || '0'}" height="${params.height || '0'}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M13 13L19 19M8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15Z" stroke="${params.fill || '1'}" stroke-width="${params.stroke_width || '1'}" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		`;
	}
}

let lazy_load = {
	home() {
		let div = create_element('div');
		div.classList.add('home-page', 'lazy-load');
		div.innerHTML = `
		<section class="hero">
			<div class="container">
				<div class="lazy image"></div>
			</div>
		</section>
		<section class="about">
			<div class="container">
				<div class="lazy image"></div>
				<div class="lazy image"></div>
			</div>
		</section>
		`;
		return div;
	},
	product() {
		let div = create_element('div');
		div.classList.add('page', 'product-detail-page', 'lazy-load');
		div.innerHTML = `
		<div class="breadcrumbs" style="height: 45px;"></div>
		<section>
			<div class="container">
				<div class="section-heading">
					<div class="lazy medium-content mb-14"></div>
					<div class="lazy short-content"></div>
				</div>
				<div class="process-row mb-24">
					<div class="lazy btn"></div>
					<div class="lazy btn"></div>
				</div>
				<div class="lazy short-content mb-8"></div>
				<div class="lazy short-content mb-8"></div>
				<div class="lazy short-content mb-8"></div>
			</div>
		</section>
		`;
		return div;
	},
	articles_page() {
		let div = create_element('div');
		div.classList.add('page', 'articles-page', 'lazy-load');
		div.innerHTML = `
		<div class="breadcrumbs" style="height: 45px;"></div>
		<section>
			<div class="container">
				<h3 class="section-title mb-24">Tin tức</h3>
				<div class="grid" style="grid-gap: 40px;">
					<div class="article">
						<div class="lazy image"></div>
					</div>
					<div class="article">
						<div class="lazy image"></div>
					</div>
					<div class="article">
						<div class="lazy image"></div>
					</div>
					<div class="article">
						<div class="lazy image"></div>
					</div>
					<div class="article">
						<div class="lazy image"></div>
					</div>
				</div>
			</div>
		</section>
		`;
		
		return div;
	},
	article_detail() {
		let div = create_element('div');
		div.classList.add('page', 'article-detail-page', 'lazy-load');
		div.innerHTML = `
		<div class="breadcrumbs" style="height: 45px;"></div>
		<section>
			<div class="container">
				<div class="content">
					<div class="lazy medium-content mb-14"></div>
					<div class="lazy short-content mb-40"></div>
					
					<div class="lazy image"></div>
					<div class="lazy medium-content mb-8"></div>
					<div class="lazy medium-content mb-8"></div>
					<div class="lazy medium-content mb-8"></div>
				</div>
			</div>
		</section>
		`;
		
		return div;
	},
	products_page() {
		let div = create_element('div');
		div.classList.add('page', 'products-page', 'lazy-load');
		div.innerHTML = `
		<div class="breadcrumbs" style="height: 45px;"></div>
		<section>
			<div class="container">
				<div class="grid" style="grid-gap: 28px;">
					<div class="item">
						<div class="lazy image"></div>
					</div>
					<div class="item">
						<div class="lazy image"></div>
					</div>
					<div class="item">
						<div class="lazy image"></div>
					</div>
					<div class="item">
						<div class="lazy image"></div>
					</div>
					<div class="item">
						<div class="lazy image"></div>
					</div>
				</div>
			</div>
		</section>
		`;
		
		return div;
	}
}

async function preview_image(params) {
	let {preview, input, callback} = params;
	input.addEventListener('change', () => {
		let file = input.files[0],
				reader = new FileReader();
		input.value = '';
		
		if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
			toast({
				message: '<i class="fa-regular fa-circle-xmark text-danger mr-6"></i> Ảnh không hợp lệ',
				type: 'danger'
			});
			return false;
		}

		reader.addEventListener('load', async () => {
			preview.style.backgroundImage = `url(${reader.result})`;
			if (callback) {
				await callback();
			}
			return false;
		});

		if (file) reader.readAsDataURL(file);
	});
}

async function checkbox_toggle(checkbox, dom_toggle, display_style) {
	checkbox.addEventListener('change', (e) => {
		if (e.target.checked == true) {
			dom_toggle.style.display = display_style;
		}
		else {
			dom_toggle.style.display = 'none';
		}
	});
}

async function set_local_storage(params) {
	let {name, value, callback} = params;
	localStorage.setItem(name, JSON.stringify(value));
	if (callback) await callback();
}

async function get_local_storage(params) {
	let {name, callback} = params;
	if (localStorage.getItem(name)) {
		if (callback) await callback();
		return JSON.parse(localStorage.getItem(name));
	}
}

async function remove_local_storage(params) {
	let {name, callback} = params;
	if (localStorage.getItem(name)) {
		localStorage.removeItem(name);
		if (callback) await callback();
	}
}

function get_current_date() {
	let today = new Date();
	
	let year = today.getFullYear(),
			month = today.getMonth() + 1,
			day = today.getDate();
	
	if (day < 10) day = '0' + day;
	if (month < 10) month = '0' + month;
	
	return year + '-' + month + '-' + day;
}

function format_date(date) {
	let year = date.split('-')[0],
			month = date.split('-')[1],
			day = date.split('-')[2];
	
	return day + '/' + month + '/' + year;
}

function format_price(price) {
	return price.toLocaleString('vi-VN');
}

async function number_only(input) {
	window.addEventListener('keyup', (e) => {
		if (e.keyCode == 18 || e.keyCode == 13) return false;
	})
	
	if (/\D/.test(input.target.value)) {
		toast({
			message: `${render_icon.circle_warning({
				width: 14,
				height: 14,
				fill: '#f93154',
				stroke_width: 1.5
			})} Dữ liệu không hợp lệ`,
			type: 'danger'
		});
		input.target.classList.add('error');
		input.target.value = input.target.value;

		return false;
	}
	else {
		input.target.classList.remove('error');
	}
}

async function input_required_check(params) {
	let {dom} = params;
	let require_list = dom.querySelectorAll('[required]');
	
	for (let input of require_list) {
		input.addEventListener('change', (e) =>{
			e.target.classList.remove('error');
		});
		
		input.addEventListener('input', (e) =>{
			e.target.classList.remove('error');
		});
		
		input.addEventListener('mouseup', (e) =>{
			e.target.classList.remove('error');
		});
		
		if (!input.value) {
			toast({
				message: `${render_icon.circle_warning({
					width: 14,
					height: 14,
					fill: '#f93154',
					stroke_width: 1.5
				})} Các trường bắt buộc không được để trống`,
				type: 'danger'
			});
			input.classList.add('error');
			
			return false;
		}
		else {
			input.classList.remove('error');
		}
		
		if (input.getAttribute('type') == 'tel' && /\D/.test(input.value)) {
			toast({
				message: `${render_icon.circle_warning({
					width: 14,
					height: 14,
					fill: '#f93154',
					stroke_width: 1.5
				})} Dữ liệu không hợp lệ`,
				type: 'danger'
			});
			input.classList.add('error');
			
			return false;
		}
		else {
			input.classList.remove('error');
		}
		
		if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/g.test(input.value) && input.classList.contains('phone-check')) {
			toast({
				message: `${render_icon.circle_warning({
					width: 14,
					height: 14,
					fill: '#f93154',
					stroke_width: 1.5
				})} Số điện thoại không hợp lệ`,
				type: 'danger'
			});
			input.classList.add('error');
			
			return false;
		}
		else {
			input.classList.remove('error');
		}
	}
}

async function parse_jwt(token) {
	var base_64_url = token.split('.')[1];
	var base_64 = base_64_url.replace(/-/g, '+').replace(/_/g, '/');
	var json_payload = decodeURIComponent(window.atob(base_64).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));

	return JSON.parse(json_payload);
}

async function side_btn_group() {
	let div = create_element('div');
	div.classList.add('side-btn-group');
	div.innerHTML = `
	<a href="https://zalo.me/2054958874373956659" target="_blank">
		<img src="/assets/images/zalo.svg">
	</a>
	`;
	
	document.body.appendChild(div);
	
	return div;
}

function status_vietsub(status) {
	let vietsub = '';
	if (status.toLowerCase() == 'draft') vietsub = '<span class="text-warning">Chờ duyệt</span>';
	if (status.toLowerCase() == 'canceled') vietsub = '<span class="text-danger">Hủy HĐ</span>';
	if (status.toLowerCase() == 'disapproved') vietsub = '<span class="text-danger">Hủy đơn</span>';
	if (status.toLowerCase() == 'success') vietsub = '<span class="text-success">Thành công</span>';
	if (status.toLowerCase() == 'error') vietsub = '<span class="text-danger">Thất bại</span>';
	if (status.toLowerCase() == 'waiting_for_transaction') vietsub = '<span class="text-warning">Đang giao dịch</span>';
	if (status.toLowerCase() == 'pending') vietsub = '<span class="text-warning">Chưa thanh toán</span>';
	
	return vietsub;
}

async function login_as_guest() {
	let login_request = {
		url: bhdt_api + api_end_point.login,
		method: 'POST',
		auth: '',
		body: {
			username: 'guest',
			password: 'guest'
		},
		async callback(params) {
			await handle_sign_in(params);
		}
	}
	
	async function handle_sign_in(params) {
		let {token, username, apiKey} = params.data;
		await set_local_storage({
			name: 'guest',
			value: {
				user: token,
				name: username,
				api_key: apiKey
			}
		});
		await location.reload();
	}
	
	await fetch_data(login_request);
}

async function check_expried_token(params) {
	if (!params) return false;
	
	let modal_settings = {
		id: 'reload_modal',
		modal_template: {
			body: {
				html: `
				<div class="d-flex align-items-center justify-content-center" style="transform: translate(0, 12px);">
				${render_icon.circle_warning({
					width: 18,
					height: 18,
					fill: '#ffa900',
					stroke_width: 2
				})}
				<h3 style="margin-left: 12px;">Phiên đăng nhập đã hết hạn, bạn vui lòng tải lại trang nhé</h3>
				</div>
				`
			},
			footer: {
				html: `
				<div class="text-center">
					<button type="button" id="ok" class="btn btn-cyan">Tải lại</button>
				</div>
				`
			}
		},
		async okay() {
			// await logout();
			await location.reload()
		}
	}
	
	let a = params;
	let token_json = await parse_jwt(a.user);
	let exp = token_json.exp;
	let name = '';
	if (localStorage.getItem('guest')) name = 'guest';
	if (localStorage.getItem('user')) name = 'user';

	async function logout() {
		let logout_request = {
			method: 'POST',
			url: bhdt_api + api_end_point.logout,
			api_key: a.api_key,
			auth: a.user,
			body: {}
		}
		// await fetch_data(logout_request);
	}
	
	if (!(Math.floor(Date.now() / 1000) <= exp)) {
		let modal = await import('./components/modal.js');
		document.body.appendChild(await modal.default(modal_settings));
		await remove_local_storage({
			name: name
		})
		return false;
	}
}

async function convert_timestamp(params) {
	let day = new Date(params).getDate(),
			month = new Date(params).getMonth() + 1,
			year = new Date(params).getFullYear(),
			hour = new Date(params).getHours(),
			minute = new Date(params).getMinutes();
	
	if (month < 10) month = `0${month}`;
  if (day < 10) day = `0${day}`;
  if (minute < 10) minute = `0${minute}`;
  if (hour < 10) hour = `0${hour}`;
	
	return day + '/' + month + '/' + year + ' - ' + hour + ':' + minute;
}

export {
	create_element,
	render_icon,
	api_end_point,
	fetch_data,
	fetch_form_data,
	toast,
	preview_image,
	checkbox_toggle,
	bhdt_api,
	get_local_storage,
	set_local_storage,
	remove_local_storage,
	get_current_date,
	format_date,
	format_price,
	input_required_check,
	loader,
	remove_loader,
	lazy_load,
	parse_jwt,
	side_btn_group,
	status_vietsub,
	url_callback,
	login_as_guest,
	number_only,
	check_expried_token,
	convert_timestamp
}