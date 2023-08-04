import {
	create_element,
	render_icon,
	fetch_data,
	api_end_point,
	bhdt_api,
	format_price,
	toast,
	get_local_storage,
	status_vietsub
} from '../helper.js';

let user_local_storage = '';
if (localStorage.getItem('user')) {
	user_local_storage = await get_local_storage({name: 'user'});
}

if (localStorage.getItem('guest')) {
	user_local_storage = await get_local_storage({name: 'guest'});
}

let icon_settings = {
	times: {
		width: 12,
		height: 12,
		fill: '#000',
		stroke_width: 1.5
	},
	arrow_right: {
		width: 18,
		height: 10,
		fill: '#000',
		stroke_width: 1.5
	},
	circle_warning: {
		width: 14,
		height: 14,
		fill: '#856404',
		stroke_width: 1.5
	}
}

let payment_body = {
	paymentGateway: 'VNPAY',
	paymentMethod: 'VNPAY',
	amount: 0,
	language: 'vn',
	order: '',
	urlCallback: '/portal/payment/vnpay/clien2'
}

export const render = async (params) => {
	let {data, res} = params;
	let {insurancePackageInfo, totalAmount} = data,
			{codeContract} = res.data;
	
	payment_body['amount'] = parseInt(totalAmount);
	payment_body['order'] = codeContract;
	
	let start_date = insurancePackageInfo['ngay_hl'],
			end_date = insurancePackageInfo['ngay_hl'];
	
	if (insurancePackageInfo['gcn_dl_ttin_hd']) {
		start_date = insurancePackageInfo['gcn_dl_ttin_hd']['ngay_hl'];
		end_date = insurancePackageInfo['gcn_dl_ttin_hd']['ngay_kt'];
	}
	
	let modal = create_element('div');
	modal.classList.add('modal');
	
	async function remove_modal(dom_trigger) {
		dom_trigger.addEventListener('click', () => {
			let confirm_close = confirm('Bạn có muốn đóng thông tin thanh toán?');
			if (confirm_close == true) {
				modal.remove();
				document.body.classList.remove('overflow-hidden');
			}
		});
	}
	
	let payment_request = {
		method: 'POST',
		url: bhdt_api + api_end_point.payment,
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {},
		async callback(params) {
			get_payment_url(params)
		}
	}
	
	async function get_payment_url(params) {
		let {vnp_PayUrl, vnp_TxnRef} = params.data;
		let a = create_element('a');
		a.setAttribute('href', vnp_PayUrl);
		a.setAttribute('target', '_blank');
		a.click();
		modal.querySelector('#vnp_tnxref').innerHTML = vnp_TxnRef;
		modal.querySelector('#payment_status').innerHTML = status_vietsub(params.message);
	}
	
	modal.innerHTML = `
	<div class="overlay"></div>
	<div class="modal-dialog">
		<div class="modal-content">
			
		</div>
	</div>
	`;
	
	async function modal_header() {
		let div = create_element('div');
		div.classList.add('modal-header');
		div.innerHTML = `
		<h4 class="modal-title">Thanh toán</h4>
		<p class="text-secondary">Vui lòng kiểm tra lại thông tin đơn hàng vừa đặt</p>
		<button type="button" class="btn">${render_icon.times(icon_settings.times)}</button>
		`;
		remove_modal(div.querySelector('.btn'));
		
		return div;
	}
	
	async function modal_body() {
		let div = create_element('div');
		div.classList.add('modal-body');
		div.innerHTML = `
		<h4 class="mb-14">Thông tin thanh toán</h4>
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
			<b id="vnp_tnxref" class="col-8 mb-12"></b>

			<span class="col-4 text-secondary">Trạng thái giao dịch</span>
			<b id="payment_status" class="col-8"></b>
		</div><hr>
		<h4 class="mb-14">Hình thức thanh toán</h4>
		<!--
		<div class="d-flex mb-14">
			<label for="language_1" class="label cursor-pointer d-flex align-items-center mr-14">
				<input id="language_1" class="mr-6" type="radio" name="language" checked required value="VN">
				<span style="font-weight: 500;">Tiếng Việt</span>
			</label>
		</div>
		-->
		<div class="mb-14 payment-row">
			<span class="item active"><img src="/assets/images/partners/vnpay.svg"></span>
		</div>
		<select class="input mb-14" name="payment-method">
			<option value="VNPAY" selected>Cổng thanh toán VNPAYQR</option>
			<option value="VNPAYQR">Thanh toán bằng ứng dụng hỗ trợ VNPAYQR</option>
			<option value="VNBANK">Thanh toán qua thẻ ATM/Tài khoản nội địa</option>
			<option value="INTCARD">Thanh toán qua thẻ quốc tế</option>
		</select>
		`;
		
		let select_method = div.querySelector('select');
		select_method.addEventListener('change', (e) => {
			payment_body['paymentMethod'] = e.target.value;
		});
		
		return div;
	}
	
	async function modal_footer() {
		let div = create_element('div');
		div.classList.add('modal-footer', 'text-right');
		div.innerHTML = `
		<button class="btn btn-cyan">Hoàn thành</button>
		<button class="btn btn-primary">Thanh toán</button>
		`;
		let paid_btn = div.querySelector('.btn-primary');
		paid_btn.addEventListener('click', async () => {
			payment_request['body'] = payment_body;
			await fetch_data(payment_request);
		});
		
		return div;
	}
	
	modal.querySelector('.modal-content').appendChild(await modal_header());
	modal.querySelector('.modal-content').appendChild(await modal_body());
	modal.querySelector('.modal-content').appendChild(await modal_footer());
	
	return modal;
}

export const callback = async () => {}