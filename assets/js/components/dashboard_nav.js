import {
	create_element,
	render_icon
} from '../helper.js';

let router = [
	{
		text: 'Trang cá nhân',
		url: '/dashboard'
	},
	{
		text: 'Quản lý nhóm sale',
		url: '/dashboard/sale-management'
	},
	{
		text: 'Lịch sử bán hàng',
		url: '/dashboard/sale-history'
	},
	{
		text: 'Thống kê hợp đồng',
		url: '/dashboard/contract-statistics'
	},
	{
		text: 'Doanh thu',
		url: '/dashboard/revenue'
	}
];

let icon_settings = {
	hamburger: {
		width: 14,
		height: 10,
		fill: '#000',
		stroke_width: 2
	},
	arrow_right: {
		width: 18,
		height: 10,
		fill: '#333',
		stroke_width: 1.5
	}
}

let pathname = location.pathname;

export default async function dashboard_nav(params) {
	let {name, type_customer} = params;
	
	if (params && type_customer != 'agent') {
		router = [
			{
				text: 'Trang cá nhân',
				url: '/dashboard'
			},
			{
				text: 'Lịch sử mua hàng',
				url: '/dashboard/sale-history'
			},
			{
				text: 'Doanh thu',
				url: '/dashboard/revenue'
			}
		]
	}
	
	let overlay = create_element('div');
	overlay.classList.add('overlay');
	let nav = create_element('nav');
	nav.classList.add('vertical-nav');
	nav.innerHTML = `
	<div class="d-flex">
		<h3>
			<span style="font-size: 20px;">👋</span>
			<span class="text-secondary"> Welcome back, </span> 
			<b>${name}</b>
		</h3>
		<button type="button" class="btn btn-light nav-trigger">${render_icon.hamburger(icon_settings.hamburger)}</button>
	</div>
	
	<ul></ul>
	`;
	
	router.map(nav_link => {
		let {text, url} = nav_link;

		let li = create_element('li');
		li.innerHTML = `
		<a href="${url}"><span>${text}</span></a></li>
		`;

		nav.querySelector('ul').appendChild(li);
	});
	
	let link_list = nav.querySelectorAll('a');
	for (let a of link_list) {
		if (a.getAttribute('href') == pathname) {
			a.classList.add('active');
			break;
		}
	}
	
	nav.querySelector('.nav-trigger').addEventListener('click', () => {
		nav.querySelector('ul').classList.add('show');
		nav.appendChild(overlay);
		document.body.classList.add('overflow-hidden');
	});
	
	overlay.addEventListener('click', () => {
		overlay.remove();
		nav.querySelector('ul').classList.remove('show');
		document.body.classList.remove('overflow-hidden');
	});
	
	return nav;
}