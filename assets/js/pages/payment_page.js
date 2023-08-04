import {
	create_element,
	render_icon,
	fetch_data,
	api_end_point,
	bhdt_api,
	format_price,
	toast,
	get_local_storage,
	set_local_storage,
	remove_local_storage,
	status_vietsub,
	loader,
	remove_loader,
	url_callback
} from '../helper.js';

let user_local_storage = await get_local_storage({name: 'user'});
let payment_local = await get_local_storage({name: 'payment'});

let icon_settings = {
	arrow_right: {
		width: 18,
		height: 10,
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

let payment_body = {
	paymentGateway: 'VNPAY',
	paymentMethod: 'VNPAY',
	amount: 0,
	language: 'vn',
	order: '',
	urlCallback: url_callback
}

let status = status_vietsub('pending'),
		current_url = window.location.href,
		search_params = new URLSearchParams(current_url),
		end_point = '',
		order_id = '',
		order_code = '',
		rsp_code = '',
		contract_id = ''

export const render = async (params) => {
	if (params.end_point) {
		end_point = params.end_point;
		status = `<span class="text-success">${decodeURIComponent(search_params.get('message'))}</span>`;
		order_id = decodeURIComponent(search_params.get('orderId'));
		order_code = location.search.includes('code=1');
		rsp_code = decodeURIComponent(search_params.get('rspCode'));
		contract_id = decodeURIComponent(search_params.get('contractId'));
	}
	
	if (payment_local['vnp_TxnRef']) order_id = payment_local['vnp_TxnRef'];
	
	let {data, res} = payment_local;
	let {insurancePackageInfo, totalAmount} = data,
			{codeContract} = res['data'];
	
	let start_date = insurancePackageInfo['ngay_hl'],
			end_date = insurancePackageInfo['ngay_hl'];
	
	if (insurancePackageInfo['gcn_dl_ttin_hd']) {
		start_date = insurancePackageInfo['gcn_dl_ttin_hd']['ngay_hl'];
		end_date = insurancePackageInfo['gcn_dl_ttin_hd']['ngay_kt'];
	}
	
	payment_body.amount = parseInt(totalAmount);
	payment_body.order = codeContract;
	
	let payment_request = {
		method: 'POST',
		url: bhdt_api + api_end_point.payment,
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {},
		async callback(params) {
			await get_payment_url(params);
		}
	}
	
	let template = create_element('div');
	template.classList.add('page', 'payment-page');
	let section = create_element('section');
	let container = create_element('div');
	container.classList.add('container', 'grid-md-2');
	
	async function get_payment_url(params) {
		let {vnp_PayUrl, vnp_TxnRef} = params.data;
		let a = create_element('a');
		a.setAttribute('href', vnp_PayUrl);
		a.setAttribute('target', '_blank');
		a.click();
		order_id = vnp_TxnRef;
		template.querySelector('#payment_code').innerHTML = order_id;
		payment_local['vnp_TxnRef'] = vnp_TxnRef;
		await set_local_storage({
			name: 'payment',
			value: payment_local
		})
	}
	
	async function page_content_left() {
		let div = create_element('div');
		div.innerHTML = `
		<div class="row mb-14">
			<span class="col-4 mb-12 text-secondary">Mã hợp đồng</span>
			<b class="col-8 mb-12">${codeContract || ''}</b>

			<span class="col-4 mb-12 text-secondary">Ngày hiệu lực</span>
			<b class="col-8 mb-12">
				${start_date || ''}
				<span style="margin: 0 8px">
					${render_icon.arrow_right(icon_settings.arrow_right)}
				</span>
				${end_date || ''}
			</b>

			<span class="col-4 mb-12 text-secondary">Số tiền thanh toán</span>
			<b class="col-8 mb-12">${format_price(parseInt(totalAmount)) || ''} VND</b>

			<span class="col-4 mb-12 text-secondary">Mã giao dịch</span>
			<b id="payment_code" class="col-8 mb-12"></b>

			<span class="col-4 text-secondary">Trạng thái giao dịch</span>
			<b id="payment_status" class="col-8">${status}</b>
		</div><hr>
		<h4 class="mb-14">Hình thức thanh toán</h4>
		<div class="mb-14 payment-row">
			<span class="item active"><img src="/assets/images/partners/vnpay.svg"></span>
		</div>
		${
		!end_point.length
		? `<button class="btn btn-primary">Thanh toán</button>`
		: ``
		}
		`;
		
		if (!end_point.length) {
			let paid_btn = div.querySelector('.btn-primary');
			let modal = create_element('div');
			modal.classList.add('modal');
			modal.innerHTML = `
			<div class="overlay"></div>
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header" style="border: 0;"></div>
					<div class="modal-body">
						<h3 class="text-center mb-18">
							Bạn vui lòng thực hiện giao dịch bên cổng thanh toán nhé
						</h3>
						<p class="d-flex align-items-center justify-content-center">
							
							<a href="/" class="btn btn-light">Quay về trang chủ</a>
							<span style="margin: 0 8px;">Hoặc</span>
							<a href="/dashboard/sale-history" class="btn btn-cyan">Xem lịch sử đơn hàng</a>
						</p>
					</div>
					<div class="modal-footer"></div>
				</div>
			</div>
			`;
			
			paid_btn.addEventListener('click', async (e) => {
				document.body.classList.add('overflow-hidden');
				document.body.appendChild(modal);
				payment_request['body'] = payment_body;
				await fetch_data(payment_request);
				e.target.remove();
			});
		}
		
		return div;
	}
	
	let confỉrm_order_request = {
		method: 'POST',
		url: bhdt_api + api_end_point.contract + '/confirm',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {
			orderId: order_id,
			id: parseInt(contract_id),
			statusTest: 'SUCCESS'
		},
		async callback(params) {
			await remove_loader();
			await handle_after_confirm(params);
		}
	}
	
	async function handle_after_confirm(params) {
		let {data} = params;
		let result_data = JSON.parse(data['resultData']);
		let {file} = result_data['data'];
		
		if (data['provideCode'] == 'PVI') {
			console.log(result_data);
			file = result_data['URL']
		}
		
		if (template.querySelector('#view_contract a')) template.querySelector('#view_contract a').remove();
		
		let btn_view_contract = create_element('a');
		btn_view_contract.classList.add('btn', 'btn-cyan');
		btn_view_contract.setAttribute('target', '_blank');
		btn_view_contract.setAttribute('href', file);
		btn_view_contract.innerHTML = 'Xem giấy chứng nhận';
		
		template.querySelector('#view_contract').appendChild(btn_view_contract);
	}
	
	async function page_content_right() {
		let div = create_element('div');
		div.innerHTML = `
		${
		!order_code || !rsp_code
		? `
		${
		payment_local.res.data.customer && payment_local.res.data.customer.newCustomer == true
		? `
		<p class="mb-14 note">
			<b class="mb-8 d-block">
				Bạn đã đăng nhập bằng tài khoản dưới đây, lịch sử mua hàng có thể xem <a href="/dashboard" style="color: #3B71CA;">trong trang quản trị</a>
			</b>
		</p>
		<div class="row mb-12">
			<span class="col-4 text-secondary">Tên đăng nhập</span>
			<b class="col-8">${user_local_storage.name}</b>
		</div>
		<div class="row mb-12">
			<span class="col-4 text-secondary">Mật khẩu</span>
			<b class="col-8">${payment_local.res.data.customer.password}</b>
		</div>
		`
		: ``
		}
		
		`
		: ``
		}

		${
		order_code == '1' && rsp_code == '00'
		? `
		<p class="mb-14 note">
			<b class="mb-8 d-block">
				Đơn đã được tạo thành công, bạn có thể duyệt đơn trong <a href="/dashboard" style="color: #3B71CA;">trong trang quản trị</a> hoặc nhấn <span style="color: #3B71CA;">"Duyệt đơn"</span> ở phía dưới để chuyển trạng thái đơn sang <span class="text-success">Hoàn thành</span>
			</b>
		</p>
		<div id="view_contract" class="mb-12 d-flex align-items-center">
			<button type="button" class="btn btn-primary mr-12">Duyệt đơn</button>
		</div>
		<em>(*) Đơn có thể mất từ 1 - 5 phút để duyệt, bạn vui lòng đợi nhé</em>
		`
		: ``
		}
		`;
		delete payment_local['res']['data']['customer'];
		await set_local_storage({name: 'payment', value: payment_local});
		
		if (div.querySelector('.btn')) {
			div.querySelector('.btn').addEventListener('click', async () => {
				if (order_code != '1' && rsp_code != '00') {
					toast({
						message: `${render_icon.circle_warning(icon_settings.circle_warning)} Đơn không thể duyệt`,
						type: 'warning'
					});
					return false;
				}
				loader();
				await fetch_data(confỉrm_order_request)
			});
		}
		
		return div;
	}
	
	container.appendChild(await page_content_left());
	container.appendChild(await page_content_right());
	section.appendChild(await container);
	template.appendChild(await section);
	
	return template;
}

export const error_page = async () => {
	let template = create_element('div');
	template.innerHTML = `
	<br><br><br><br>
	<h1 class="text-center">Chưa có đơn hàng được thực hiện thao tác thanh toán<br> <a class="text-primary" href="/">Quay về trang chủ</a><h1>`;
	
	return template;
}