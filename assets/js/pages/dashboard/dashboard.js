import {
	create_element,
	render_icon,
	fetch_data,
	bhdt_api,
	api_end_point,
	get_local_storage
} from '../../helper.js';

let user_local_storage = await get_local_storage({name: 'user'});
import dashboard_nav from '../../components/dashboard_nav.js';

export const render = async () => {
	let div = create_element('div');
	div.classList.add('dashboard');
	div.appendChild(await dashboard_nav(user_local_storage));
	
	if (location.pathname == '/dashboard') {
		let block = await import('./pages/personal_info_page.js');
		div.appendChild(await block.render({
			user_local_storage: user_local_storage
		}));
	}
	
	if (location.pathname == '/dashboard/sale-management') {
		let block = await import('./pages/sale_management_page.js');
		div.appendChild(await block.render({
			user_local_storage: user_local_storage
		}));
	}
	
	if (location.pathname == '/dashboard/revenue') {
		let block = await import('./pages/revenue_page.js');
		div.appendChild(await block.render({
			user_local_storage: user_local_storage
		}));
	}
	
	if (location.pathname == '/dashboard/sale-history') {
		let block = await import('./pages/sale_history_page.js');
		div.appendChild(await block.render({
			user_local_storage: user_local_storage
		}));
	}
	
	if (location.pathname == '/dashboard/buy-history') {
		let block = await import('./pages/buy_history_page.js');
		div.appendChild(await block.render({
			user_local_storage: user_local_storage
		}));
	}
	
	if (location.pathname == '/dashboard/contract-statistics') {
		let block = await import('./pages/contract_statistics_page.js');
		div.appendChild(await block.render({
			user_local_storage: user_local_storage
		}));
	}
	
	if (location.pathname.includes('/dashboard/order-id')) {
		let block = await import('./pages/order_detail_page.js');
		let end_point = location.pathname.split('/')[2].replace('order-id=', '');
		let order_detail_request = {
			url: bhdt_api + api_end_point.contract + '/' + end_point,
			method: 'GET',
			auth: user_local_storage['user'],
			api_key: user_local_storage['api_key'],
			async callback(params) {
				div.appendChild(await block.render({
					order_id: end_point,
					user_local_storage: user_local_storage,
					data: params
				}));
			}
		}
		fetch_data(order_detail_request);
	}
	
	return div;
}

export const error_page = async () => {
	let template = create_element('div');
	template.classList.add('container');
	template.innerHTML = `
	<br><br><br><br>
	<h1 class="text-center">Bạn cần phải đăng nhập để vào trang quản trị<br> <a class="text-primary" href="/">Quay về trang chủ</a><h1>
	<br><br><br><br>
	`;
	
	return template;
}