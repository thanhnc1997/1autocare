import {
	create_element,
	bhdt_api,
	api_end_point,
	fetch_data,
	format_price,
	status_vietsub,
	render_icon,
	loader,
	remove_loader,
	url_callback,
	convert_timestamp
} from '../../../helper.js';

import dashboard_nav from '../../../components/dashboard_nav.js';

let sale_history = {
	name: '',
	providerCode: '',
	byChild: false
}

let customer_type = '';

let icon_settings = {
	dots_h: {
		width: 14,
		height: 4,
		fill: '#333',
		stroke_width: 1.5
	},
	chevron_down: {
		width: 10,
		height: 7,
		fill: '#000',
		stroke_width: 1.5
	},
	chevron_left: {
		width: 8,
		height: 12,
		fill: '#000',
		stroke_width: 1.5
	},
	chevron_right: {
		width: 8,
		height: 12,
		fill: '#000',
		stroke_width: 1.5
	}
}

let skip = 1,
		limit = 10,
		total_page = 0;

export const render = async (params) => {
	let {user_local_storage} = params;
	
	let template = create_element('div');
	template.classList.add('dashboard');
	let container = create_element('div');
	container.classList.add('container');
	
	async function sale_list() {
		let div = create_element('div');
		div.innerHTML = `
		<h3 class="section-title small">Lịch sử đơn hàng</h3>
		<div class="card">
			<nav class="table-pagination">
				<span class="page"></span>
				<select class="select" name="records">
					<option value="10" selected>10</option>
					<option value="20">20</option>
					<option value="40">40</option>
				</select>
				<button class="btn prev">
					${render_icon.chevron_left(icon_settings.chevron_left)}
				</button>
				<button class="btn next">
					${render_icon.chevron_right(icon_settings.chevron_right)}
				</button>
			</nav>
			<div class="scrollable-table" style="min-height: 150px;">
				<table class="table">
					<thead class="text-left">
						<tr>
							<!-- <th><input type="checkbox" name="check_all"></th> -->
							<th>Mã HĐ</th>
							<th>Ngày cập nhật</th>
							<th>Giá trị HĐ</th>
							<th>Loại HĐ</th>
							<!-- <th>Người tạo</th> -->
							<th>Kết quả</th>
							<th>Trạng thái</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</div>
		`;
		let table = div.querySelector('table'),
				prev = div.querySelector('.table-pagination .prev'),
				next = div.querySelector('.table-pagination .next'),
				select = div.querySelector('.table-pagination [name="records"]');
		/*
		table.querySelector('[name="check_all"]').addEventListener('change', (e) => {
			if (e.target.checked == true) {
				table.querySelectorAll('tbody input[type="checkbox"]').forEach(input => {
					input.checked = true;
				});
			}
			else {
				table.querySelectorAll('tbody input[type="checkbox"]').forEach(input => {
					input.checked = false;
				});
			}
		});
		*/
		prev.addEventListener('click', async () => {
			load_record_per_page('des');
		});
		
		next.addEventListener('click', async () => {
			load_record_per_page('ins');
		});
		
		select.addEventListener('change', async (e) => {
			limit = e.target.value;
			get_sale_history_request.url = bhdt_api + api_end_point.sale_history + `?crPage=1&maxRow=${limit}`;
			await load_record_per_page();
		});
		
		return div;
	}
	
	async function load_record_per_page(type) {
		if (type == 'ins') skip += 1;
		if (type == 'des') skip -= 1;
		if (!type) skip = 1;
		
		if (skip > total_page) {
			skip = total_page;
			template.querySelector('.table-pagination .page').innerHTML = `Trang ${skip} / ${total_page}`;
			return;
		}
		
		if (skip < 1) {
			skip = 1;
			template.querySelector('.table-pagination .page').innerHTML = `Trang ${skip} / ${total_page}`;
			return;
		}
		
		get_sale_history_request.url = bhdt_api + api_end_point.sale_history + `?crPage=${skip}&maxRow=${limit}`;
		await loader();
		await fetch_data(get_sale_history_request);
	}
	
	let get_info_request = {
		url: bhdt_api + api_end_point.profile,
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		async callback(params) {
			if (params['data']['typeCustomer'] == 'agent') {
				// sale_history['byChild'] = true;
				sale_history['byChild'] = false;
				customer_type = 'agent';
			}
			template.appendChild(await dashboard_nav({
				local: user_local_storage,
				data: params
			}));
			container.appendChild(await sale_list(params));
			template.appendChild(container);
		}
	}
	
	let get_sale_history_request = {
		url: bhdt_api + api_end_point.sale_history + `?crPage=${skip}&maxRow=${limit}`,
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: sale_history,
		async callback(params) {
			await remove_loader();
			await render_sale_history(params);
			await get_total_page(params);
		}
	}
	
	let confirm_order_request = {
		url: bhdt_api + api_end_point.contract + '/confirm',
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {},
		async callback(params) {
			await remove_loader();
			await fetch_data(get_sale_history_request);
		}
	}
	
	async function get_total_page(params) {
		let {totalRow} = params;
		total_page = Math.ceil(totalRow / limit);
		
		template.querySelector('.page').innerHTML = `Trang ${skip} / ${total_page}`;
	}
	
	async function render_sale_history(params) {
		template.querySelector('tbody').innerHTML = '';
		let {datas} = params;
		datas.map(async (order, index) => {
			let {
				id, 
				providerCode, 
				createdBy, 
				codeContract, 
				totalAmount, 
				insurancePackage,
				status,
				resultData,
				hasPay,
				createdAt
			} = order;
			
			let result_data = '',
					link = '';
			
			if (resultData) result_data = JSON.parse(resultData);
			
			if (typeof result_data == 'object') {
				if (order['providerCode'] == 'MIC') link = result_data['data']['file'];
				if (order['providerCode'] == 'PVI') {
					if (result_data['URL'] && result_data['URL'] != '') link = result_data['URL'];
				} 
			}
			
			let tr = create_element('tr');
			tr.innerHTML = `
			<!-- <td><input type="checkbox"></td> -->
			<td>
				<a href="/dashboard/order-id=${id}" class="text-primary" style="color: #2D63AF; font-weight: 500;">${codeContract || ''}</a>
			</td>
			<td>${await convert_timestamp(createdAt)}</td>
			<td>${format_price(totalAmount) + ' VND' || ''}</td>
			<td>${insurancePackage['namePackageProvider'] || ''}</td>
			<!-- <td>${createdBy || ''}</td> -->
			<td>
				${link != '' && status != 'CANCELED' && status != 'DISAPPROVED' && status != 'ERROR'  ? `<a class="text-primary" href="${link}" target="_blank">Xem</a>` : ``}
			</td>
			<td style="font-weight: 500;" class="action"></td>
			`;
			tr.querySelector('.action').appendChild(await render_status_dropdown({
				status: status,
				index: index,
				data_length: datas.length,
				id: id,
				paid: hasPay,
				total_amount: totalAmount,
				code_contract: codeContract,
				link: link
			}));
			
			template.querySelector('tbody').appendChild(tr);
		});
	}
	
	async function render_status_dropdown(params) {
		let {status, index, data_length, id, paid, total_amount, code_contract, link} = params;
		let style = '';
		if (index >= data_length - 3) {
			if (index <= 2) {
				style = 'top: 100%; left: 0; z-index: 1';
			}
			else {
				style = 'bottom: 100%; left: 0; z-index: 1';
			}
		}
		else {
			style = 'top: 100%; left: 0; z-index: 1';
		}
		
		let div = create_element('div');
		
		let dropdown = create_element('div');
		dropdown.classList.add('dropdown');
		dropdown.style.cssText = style;
		div.classList.add('d-flex', 'align-items-center', 'cursor-pointer', 'position-relative');
		div.innerHTML = `
		${
		paid == true && link != '' 
		? link != '' 
		? '<span class="text-success">Đã thanh toán</span>' 
		: '<span class="text-primary">Chờ kết quả</span>'
		: ''
		}
		${
		paid == false 
		? '<span class="text-danger">Chưa thanh toán</span>' 
		: ''
		}
		${render_icon.chevron_down(icon_settings.chevron_down)}
		`;
		dropdown.innerHTML = `
		<span class="dropdown-item" data-status="success">${paid == true ? 'Thành công' : 'Thanh toán'}</span>
		${customer_type == 'agent' ? '<span class="dropdown-item" data-status="confirm">Duyệt đơn</span>' : ''}
		`;
		div.appendChild(dropdown);
		div.querySelector('span').classList.add('mr-6');
		div.querySelector('svg').style.cssText = 'transition: .2s';
		
		if (div.querySelector('.dropdown')) {
			div.addEventListener('click', () => {
				if (!dropdown.classList.contains('show')) {
					dropdown.classList.add('show');
					div.querySelector('svg').classList.add('rotate');
				}
				else {
					dropdown.classList.remove('show');
					div.querySelector('svg').classList.remove('rotate');
				}
			});
		}
		
		let success_btn = dropdown.querySelector('[data-status="success"]'),
				confirm_btn = dropdown.querySelector('[data-status="confirm"]')
		if (success_btn && paid == true) {
			success_btn.addEventListener('click', async () => {
				let confỉrm_order_request = {
					method: 'POST',
					url: bhdt_api + api_end_point.contract + '/confirm',
					auth: user_local_storage['user'],
					api_key: user_local_storage['api_key'],
					show_message: true,
					body: {
						id: id
					},
					async callback(params) {
						await fetch_data(get_sale_history_request);
					}
				}
				await fetch_data(confỉrm_order_request)
			});
		}
		
		if (success_btn && paid != true) {
			success_btn.addEventListener('click', async () => {
				let payment_request = {
					method: 'POST',
					url: bhdt_api + api_end_point.payment,
					auth: user_local_storage['user'],
					api_key: user_local_storage['api_key'],
					show_message: true,
					body: {
						paymentGateway: 'VNPAY',
						paymentMethod: 'VNPAY',
						amount: total_amount,
						language: 'vn',
						order: code_contract,
						urlCallback: url_callback
					},
					async callback(params) {
						await get_payment_url(params);
					}
				}

				async function get_payment_url(params) {
					let {vnp_PayUrl, vnp_TxnRef} = params.data;
					let a = create_element('a');
					a.setAttribute('href', vnp_PayUrl);
					a.setAttribute('target', '_blank');
					a.click();
				}
				await fetch_data(payment_request);
			});
		}
		
		if (confirm_btn) {
			confirm_btn.addEventListener('click', async () => {
				confirm_order_request.body = {
					id: id,
					withPayment: false
				}
				await loader();
				await fetch_data(confirm_order_request);
			});
		}
		
		return div;
	}
	
	await fetch_data(get_info_request);
	await fetch_data(get_sale_history_request);
	
	window.addEventListener('mouseup', (e) => {
		document.querySelectorAll('.action').forEach(item => {
			if (!item.contains(e.target)) {
				if (!item.querySelector('.dropdown')) return false;
				item.querySelector('.dropdown').classList.remove('show');
				item.querySelector('svg').classList.remove('rotate');
			}
		});
	});
	
	return template;
}