import {
	create_element,
	render_icon,
	get_local_storage,
	remove_local_storage
} from '../helper.js';

let icon_settings = {
	marker: {
		width: 7.9,
		height: 10,
		fill: '#000'
	},
	envelope: {
		width: 12.8,
		height: 10,
		fill: '#000'
	},
	phone: {
		width: 10,
		height: 10,
		fill: '#000'
	},
	hamburger: {
		width: 14,
		height: 10,
		fill: '#000',
		stroke_width: 2
	},
	chevron_down: {
		width: 10,
		height: 7,
		fill: '#000',
		stroke_width: 1.5
	},
	circle_warning: {
		width: 14,
		height: 14,
		fill: '#f93154',
		stroke_width: 1.5
	}
}

let router = [
	{
		text: 'Trang chủ',
		url: '',
		active: true
	},
	{
		text: 'Sản phẩm',
		url: '#products'
	}
]

let pathname = location.pathname,
		class_active = 'class="active"';

export default async function page_header() {
	let div = create_element('header');
	div.classList.add('header');
	let user_local_storage = await get_local_storage({name: 'user'}),
			guest_local_storage = await get_local_storage({name: 'guest'}),
			user_name = ''
	
	if (user_local_storage) user_name = user_local_storage.name;
	
	async function top_bar() {
		let div = create_element('div');
		div.classList.add('top-bar');
		div.innerHTML = `
		<div class="container">
			<span class="item">
				${render_icon.marker(icon_settings.marker)}
				<span>Số 10 đường 14, P. Phú Mỹ, Q.7, TP.HCM</span>
			</span>
			<span class="item">
				${render_icon.envelope(icon_settings.envelope)}
				<span>info@1autocare.vn</span>
			</span>
			<span class="item">
				${render_icon.phone(icon_settings.phone)}
				<span>+84 (0) 866 787 939</span>
			</span>
		</div>
		`;
		
		return div;
	}
	
	async function main_header() {
		let div = create_element('div');
		div.classList.add('main-header');
		div.innerHTML = `
		<div class="container">
			<a class="logo" href="/"><img src="/assets/images/logo.png"></a>
			<nav class="main-nav">
				<ul></ul>
				<p class="no-pc mb-14">Hotline:  <b>+84 (0) 866 787 939</b></p>
				<p class="no-pc">Email:  <b>info@1autocare.vn</b></p>
			</nav>
			<div class="options-bar">
				${
				user_local_storage
				?
				`
				<div class="account">
					<span class="circle"></span>
					<span class="cursor-pointer name">${user_name || ''}</span>
					${render_icon.chevron_down(icon_settings.chevron_down)}

					<div class="dropdown">
						<a href="/dashboard" target="_blank" class="dropdown-item">Trang quản trị</a>
						<p class="dropdown-item logout">Đăng xuất</p>
					</div>
				</div>
				`
				: `<button id="sign_in" type="button" class="btn btn-yellow">Đăng nhập</button>`
				}
				<button type="button" class="btn btn-light nav-trigger">${render_icon.hamburger(icon_settings.hamburger)}</button>
			</div>
		</div>
		`;
		
		router.map(nav_link => {
			let {text, url, active} = nav_link;
			if (!active) class_active = '';
			
			if (url == pathname.split('/')[1] && url != '/') class_active = 'class="active"';
			
			let li = create_element('li');
			li.innerHTML = `
			<a href="/${url}" ${class_active}><span>${text}</span></a></li>
			`;
			
			div.querySelector('nav ul').appendChild(li);
		});
		
		if (pathname != '/') div.querySelector('nav li a').classList.remove('active');
		
		function hide_nav() {
			overlay.remove();
			div.querySelector('.main-nav').classList.remove('show');
			document.body.classList.remove('overflow-hidden');
		}
		
		let nav_trigger = div.querySelector('.nav-trigger'),
				overlay = create_element('div');
		overlay.classList.add('overlay');
		overlay.addEventListener('click', () => {
			hide_nav();
		});
		
		div.querySelectorAll('.main-nav a').forEach((item) => {
			item.addEventListener('click', () => {
				hide_nav();
			});
		});
		
		nav_trigger.addEventListener('click', () => {
			div.appendChild(overlay);
			div.querySelector('.main-nav').classList.add('show');
			document.body.classList.add('overflow-hidden');
		});
		
		if (!user_local_storage) {
			div.querySelector('#sign_in').addEventListener('click', async () => {
				let modal = await import('./sign_in_modal.js');
				document.body.appendChild(await modal.render());
				document.body.classList.add('overflow-hidden');
				await modal.callback();
			});
		}
		
		if (user_local_storage) {
			div.querySelector('.account .name').addEventListener('click', () => {
				div.querySelector('.account .dropdown').classList.toggle('show');
				div.querySelector('.account svg').classList.toggle('rotate');
			});
			
			div.querySelector('.logout').addEventListener('click', () => {
				remove_local_storage({
					name: 'user', 
					async callback() {
						await location.reload()
					}
				});
			});
		}
		
		return div;
	}
	
	div.appendChild(await top_bar());
	div.appendChild(await main_header());
	
	return div;
}