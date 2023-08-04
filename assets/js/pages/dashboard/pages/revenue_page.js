import {
	create_element,
	bhdt_api,
	api_end_point,
	fetch_data,
	format_price,
	status_vietsub,
	render_icon,
	loader,
	remove_loader
} from '../../../helper.js';

import dashboard_nav from '../../../components/dashboard_nav.js';

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

let sale_history = {
	period: 'this_month',
	startTime: '',
	endTime: '',
	byChild: true
}

let skip = 1,
		limit = 10,
		total_page = 0,
		total_revenue = 0

export const render = async (params) => {
	let {user_local_storage} = params;
	
	let template = create_element('div');
	template.classList.add('dashboard');
	let container = create_element('div');
	container.classList.add('container');
	
	async function sale_list() {
		let div = create_element('div');
		div.innerHTML = `
		<h3 class="section-title small">Doanh thu</h3>
		
		<div class="card" style="margin-bottom: 14px;">
			<div class="row">
				<div class="col-6 col-md-3">
					<select class="input" name="by_child">
						<option selected>Doanh thu cá nhân</option>
						<option>Doanh thu nhân viên</option>
					</select>
				</div>
				<div class="col-6 col-md-3">
					<select class="input" name="by_time">
						<option value="today">Hôm nay</option>
						<option value="yesterday">Hôm qua</option>
						<option value="7_day">7 ngày trước</option>
						<option value="30_day">30 ngày trước</option>
						<option selected value="this_month">Tháng này</option>
						<option value="last_month">Tháng trước</option>
						<option value="this_year">Năm nay</option>
						<option value=last_year"">Năm trước</option>
					</select>
				</div>
			</div>
		</div>
		
		<div class="card" style="margin-bottom: 18px;">
			<nav class="table-pagination">
				<span class="page">Trang 1 / 1</span>
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
			<div class="scrollable-table">
				<table class="table">
					<thead class="text-left">
						<tr>
							<th class="text-center">#</th>
							<th>Họ & tên</th>
							<th>SĐT</th>
							<th>Email</th>
							<th>Trạng thái</th>
							<th>Doanh thu</th>
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
				select = div.querySelector('.table-pagination [name="records"]'),
				by_child = div.querySelector('select[name="by_child"]'),
				by_time = div.querySelector('select[name="by_time"]')
		
		by_child.addEventListener('change', async () => {
			sale_history.byChild = !sale_history.byChild;
			await loader();
			await fetch_data(get_revenue_request);
		});
		
		by_time.addEventListener('change', async (e) => {
			sale_history.period = e.target.value;
			await loader();
			await fetch_data(get_revenue_request);
		});
		
		return div;
	}
	
	async function total_result(params) {
		if(template.querySelector('.card.total-revenue')) template.querySelector('.card.total-revenue').remove();
		let {total} = params;
		let div = create_element('div');
		div.classList.add('card', 'total-revenue');
		div.style.cssText = 'margin-bottom: 14px';
		div.innerHTML = `
		<h3>
			<span style="font-weight: 500;" class="mr-8 text-secondary">Doanh thu tổng</span>
			<span class="text-right">${format_price(parseInt(total))} VND</span>
		</h3>
		`;
		
		return div;
	}
	
	let get_revenue_request = {
		url: bhdt_api + api_end_point.revenue + '/detail',
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: sale_history,
		async callback(params) {
			await remove_loader();
			await render_revenue(params);
			// await get_total_page(params);
		}
	}
	
	let get_info_request = {
		url: bhdt_api + api_end_point.profile,
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		async callback(params) {
			template.appendChild(await dashboard_nav({
				local: user_local_storage,
				data: params
			}));
			container.appendChild(await sale_list(params));
			template.appendChild(container);
		}
	}
	
	async function render_revenue(params) {
		template.querySelector('tbody').innerHTML = '';
		let {datas} = params;
		datas.map(async (item, index) => {
			let {phone, fullName, status, email, totalRevenue} = item;
			let tr = create_element('tr');
			tr.innerHTML = `
			<td class="text-center">${index + 1}</td>
			<td>${fullName}</td>
			<td>${phone}</td>
			<td>${email || ''}</td>
			<td>
				${status == 1 ? '<span class="text-success">Hoạt động</span>' : ''}
			</td>
			<td>${parseInt(totalRevenue)} VND</td>
			`;
			total_revenue += parseInt(totalRevenue);
			
			template.querySelector('tbody').appendChild(tr);
		});
		
		container.querySelector('div').insertBefore(await total_result({total: total_revenue}), container.querySelector('.card'));
	}
	
	await fetch_data(get_info_request);
	await fetch_data(get_revenue_request);
	
	return template;
}