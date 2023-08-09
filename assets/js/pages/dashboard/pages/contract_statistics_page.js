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

let contract_statistics = {
	codeContract: '',
	period: '7_day',
	status: '',
	typeInsurance: ''
}

let customer_type = '';
let typing_timer = null;

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

let statistics_chart = null;
let chart_config = {
	type: 'bar',
	data: {
		labels: [],
		datasets: [
			{
				data: [],
				borderWidth: 1,
				backgroundColor: ['#E7AB9A', '#FFF8DE', '#ADE4DB']
			}
		]
	},
	options: {
		scales: {
			y: {
				beginAtZero: true
			}
		},
		plugins: {
			legend: {
				display: false
			}
		}
	}
}

export async function render(params) {
	let {user_local_storage} = params;
	
	let template = create_element('section');
	let container = create_element('div');
	container.classList.add('container');
	
	let get_statistics = {
		url: bhdt_api + 'thong-ke',
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: contract_statistics
	}
	
	async function sale_list() {
		let div = create_element('div');
		div.innerHTML = `
		<h3 class="section-title small">Thống kê hợp đồng</h3>

		<div class="card" style="margin-bottom: 14px;">
			<div class="row">
				<div class="col-6 col-md-3">
					<span class="label">Trạng thái</span>
					<select class="input" name="by_status">
						<option value="" selected>Chọn</option>
						<option value="SUCCESS">Thành công</option>
						<option value="PENDING">Chưa thanh toán</option>
					</select>
				</div>
				<div class="col-6 col-md-3">
					<span class="label">Thời gian</span>
					<select class="input" name="by_time">
						<option value="today">Hôm nay</option>
						<option value="yesterday">Hôm qua</option>
						<option value="7_day" selected>7 ngày trước</option>
						<option value="30_day">30 ngày trước</option>
						<option value="this_month">Tháng này</option>
						<option value="last_month">Tháng trước</option>
						<option value="this_year">Năm nay</option>
						<option value=last_year"">Năm trước</option>
					</select>
				</div>
			</div>
		</div>

		<div class="grid grid-md-4 gap-14 mb-14">
			<div class="card" style="margin: 0;">
				<p class="mb-6 text-secondary">Tổng đơn</p>
				<h3 class="total-order">120</h3>
			</div>
			<div class="card" style="margin: 0;">
				<p class="mb-6 text-secondary">Đơn thành công</p>
				<h3 class="success-order text-success">98</h3>
			</div>
			<div class="card" style="margin: 0;">
				<p class="mb-6 text-secondary">Đơn chưa thanh toán</p>
				<h3 class="unpaid-order text-danger">22</h3>
			</div>
			<div class="card" style="margin: 0;">
				<p class="mb-6 text-secondary">Doanh thu</p>
				<h3 class="total-revenue">1.135.960 VND</h3>
			</div>
		</div>
		
		<div class="card">
			<canvas id="chart" height="80vh"></canvas>
		</div>
		`;
		
		let chart = div.querySelector('#chart');
		let by_time = div.querySelector('[name="by_time"]');
		let by_status = div.querySelector('[name="by_status"]');
		
		get_statistics.callback = async function callback(callback_params) {
			await init_chart_data(callback_params, chart_config);
			statistics_chart = await new Chart(chart, chart_config);
		}
		
		by_time.addEventListener('change', async (e) => {
			contract_statistics.period = e.target.value;
			get_statistics.body = contract_statistics;
			get_statistics.callback = async function callback(callback_params) {
				await init_chart_data(callback_params, statistics_chart);
				await statistics_chart.update();
			}
			
			await fetch_data(get_statistics);
		});
		
		by_status.addEventListener('change', async (e) => {
			contract_statistics.status = e.target.value;
			get_statistics.body = contract_statistics;
			get_statistics.callback = async function callback(callback_params) {
				await init_chart_data(callback_params, statistics_chart);
				await statistics_chart.update();
			}
			
			await fetch_data(get_statistics);
		});
		
		return div;
	}
	
	async function init_chart_data(params, obj) {
		let {data} = params;
		let {dataChart} = data;
		dataChart.categories = dataChart.categories.map(i => i.replace('Ngày ', ''));
		obj.data.labels = dataChart.categories;
		obj.data.datasets[0]['data'] = dataChart.data;

		await detail_statistics(data);
	}
	
	async function detail_statistics(params) {
		let {total, totalRevenue, totalPending, totalSuccess} = params;
		
		template.querySelector('.total-order').innerHTML = total;
		template.querySelector('.success-order').innerHTML = totalSuccess;
		template.querySelector('.unpaid-order').innerHTML = totalPending;
		template.querySelector('.total-revenue').innerHTML = await format_price(totalRevenue) + ' VND';
	}
	
	container.appendChild(await sale_list());
	template.appendChild(container);
	await fetch_data(get_statistics);
	
	return template;
}