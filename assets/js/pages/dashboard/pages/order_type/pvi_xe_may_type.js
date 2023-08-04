import {
	create_element,
	get_local_storage,
	bhdt_api,
	api_end_point,
	fetch_data,
	format_price,
	status_vietsub,
	render_icon,
	loader,
	remove_loader,
	get_current_date,
	convert_timestamp
} from '../../../../helper.js';

let icon_settings = {
	chevron_left: {
		width: 10,
		height: 14,
		fill: '#333',
		stroke_width: 1.5
	}
}

let vehicle_type = {
	GFT_LOAIXEMOTOR_1002: {
		name: 'Mô tô 2 bánh trên 50cc'
	},
	GFT_LOAIXEMOTOR_1001: {
		name: 'Mô tô 2 bánh từ 50cc trở xuống'
	},
	GFT_LOAIXEMOTOR_1003: {
		name: 'Xe máy điện'
	},
	GFT_LOAIXEMOTOR_2001: {
		name: 'Mô tô 3 bánh'
	},
	GFT_LOAIXEMOTOR_2002: {
		name: 'Xe gắn máy và ác loại xe cơ giới tương tự'
	}
}

let fee_charge = {
	action: 'Get_Phi_XeMay_TNDS_MIC',
	providerCode: 'MIC',
	typeInsurance: 'bao-hiem-xe-may-pvi',
	motoCompulsory: {
		vehicleType: '',
		ngay_hl: '',
		ngay_kt: '',
		durationOfInsurance: '1',
		accidentInsurancePrice: '',
		accidentInsurance: true,
		anPhi: false
	}
}

let insurance_period = ['1', '2', '3'];
let	typing_timer = null;
let current_order = {};

let update_package = {
	buyer: {},
	beneficiary: {},
	insurancePackageInfo: {}
};

export async function render(params) {
	current_order = {...params}
	let {data, user_local_storage} = current_order;
	
	let {beneficiary} = data;
	let insurance_package_info = JSON.parse(data.insurancePackageInfo);
	let buyer_info = JSON.parse(data.buyerInfo);
	
	update_package.buyer = {...buyer_info};
	update_package.beneficiary = {...beneficiary};
	update_package.insurancePackageInfo = {...insurance_package_info};
	update_package.totalAmount = data.totalAmount;
	
	fee_charge.motoCompulsory.ngay_hl = insurance_package_info.ngay_hl;
	fee_charge.motoCompulsory.ngay_kt = insurance_package_info.ngay_kt;
	
	let template = create_element('div');
	template.classList.add('grid', 'gap-28');
	
	async function fee_calculator() {
		fee_charge.motoCompulsory = {...update_package['insurancePackageInfo']};
		
		let fee_calculator_request = {
			method: 'POST',
			url: bhdt_api + api_end_point.contract + '/tinh-phi',
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			body: fee_charge,
			async callback(data) {
				let {phi_laiphu, phi_moto, totalFee} = data.data;
				if (phi_laiphu === null || phi_moto === null || totalFee === null) {
					phi_moto = 0;
					phi_laiphu = 0;
					totalFee = 0;
				}
				template.querySelector('.motor-fee').innerHTML = format_price(parseInt(phi_moto)) + ' VND';
				template.querySelector('.extra-fee').innerHTML = format_price(parseInt(phi_laiphu)) + ' VND';
				template.querySelector('.total-fee').innerHTML = format_price(parseInt(totalFee)) + ' VND';
				await remove_loader();
				update_package.totalAmount = data.data.phi;
				update_package.insurancePackageInfo.totalPriceInsurance = data.data.phi;
			}
		}
		loader();
		await fetch_data(fee_calculator_request);
	}
	
	async function order_info(params) {
		let {data, insurance_package_info} = params;
		
		let div = create_element('div');
		div.innerHTML = `
		<div class="mb-24" style="display: flex; align-items: center;">
			<span onclick="location.href = '/dashboard/sale-history'" class="btn back mr-18">
				${render_icon.chevron_left(icon_settings.chevron_left)}
			</span>
			<h4 style="font-size: 16px;">PVI - xe máy</h4>
		</div>
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<p class="mb-6 text-secondary">Trạng thái</p>
					<h4>${status_vietsub(data.status)}</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Mã HĐ</p>
					<h4>${data.codeContract}</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Ngày tạo</p>
					<h4>${await convert_timestamp(data.createdAt)}</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Tạo bởi</p>
					<h4>${data.createdBy}</h4>
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 0;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<p class="mb-6 text-secondary">Thanh toán</p>
					<h4>${params.data.hasPay == true ? '<span class="text-success">Đã thanh toán</span>' : '<span class="text-danger">Chưa thanh toán</span>'}</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Phí motor</p>
					<h4 class="motor-fee">${format_price(insurance_package_info.phi_moto)} VND</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Phí lái phụ</p>
					<h4 class="extra-fee">${format_price(insurance_package_info.phi_laiphu)} VND</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Tổng phí</p>
					<h4 class="total-fee">${format_price(insurance_package_info.totalPriceInsurance)} VND</h4>
				</div>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function get_all_province(params, dom) {
		params.datas.map(item => {
			let {code, mainName} = item;
			let option = create_element('option');
			option.value = code;
			option.innerHTML = mainName;
			if (code == buyer_info.provinceCode) {
				option.setAttribute('selected', true);
			}
			
			dom.querySelector('[name="province"]').appendChild(option);
		});
	}
	
	async function step_1(insurance_package_info) {
		let d = insurance_package_info.ngay_hl.split('/')[0],
				m = insurance_package_info.ngay_hl.split('/')[1],
				y = insurance_package_info.ngay_hl.split('/')[2];
		let div = create_element('div');
		div.innerHTML = `
		<div class="card" style="margin-bottom: 0;">
			<div class="grid grid-md-4 gap-14 mb-14">
				<div>
					<span class="label requried">Loại xe</span>
					<select class="select" name="vehicle_type" required>
						<option value="">Chọn</option>
					</select>
				</div>
				<div>
					<span class="label requried">Ngày bắt đầu</span>
					<input type="date" class="input" name="start_date" value="${y}-${m}-${d}" required>
				</div>
				<div>
					<span class="label requried">Thời hạn bảo hiểm</span>
					<select class="select" name="insurance_period" required>
						<option value="">Chọn</option>
					</select>
				</div>
			</div>
			<label for="voluntary_buying" class="note cursor-pointer d-flex align-items-center">
				<input id="voluntary_buying" type="checkbox" class="mr-6" ${insurance_package_info.accidentInsurance === true ? 'checked' : ''}>
				<b>Tham gia bảo hiểm tai nạn lái xe và người ngồi trên xe (Số tiền bảo hiểm 10.000.000 VNĐ/ người/ vụ)</b>
			</label>
		</div>
		`;
		
		for (let v of insurance_period) {
			let option = create_element('option');
			option.value = v;
			option.innerHTML = v + ' năm';
			if (option.value == insurance_package_info.durationOfInsurance) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="insurance_period"]').appendChild(option);
		}
		
		for (let [k, v] of Object.entries(vehicle_type)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			if (option.value == insurance_package_info.vehicleType) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="vehicle_type"]').appendChild(option);
		}
		
		div.querySelector('#voluntary_buying').addEventListener('change', async (e) => {
			update_package.insurancePackageInfo.accidentInsurance = e.target.checked;
			await fee_calculator();
		});
		
		div.querySelector('[name="vehicle_type"]').addEventListener('change', async (e) => {
			update_package.insurancePackageInfo.vehicleType = e.target.value;
			await fee_calculator();
		});
		
		div.querySelector('[name="insurance_period"]').addEventListener('change', async (e) => {
			let start_date = update_package.insurancePackageInfo.ngay_hl;
			let day = start_date.split('/')[0],
					month = start_date.split('/')[1],
					year = start_date.split('/')[2],
					end_date = day + '/' + month + '/' + (parseInt(year) + parseInt(e.target.value));
			
			update_package.insurancePackageInfo.durationOfInsurance = e.target.value;
			update_package.insurancePackageInfo.ngay_kt = end_date;
			
			await fee_calculator();
		});
		
		div.querySelector('[name="start_date"]').addEventListener('input', (e) => {
			let day = e.target.value.split('-')[2],
					month = e.target.value.split('-')[1],
					year = e.target.value.split('-')[0],
					start_value = day + '/' + month + '/' + year;
			
			let start_date = get_current_date();
			if ((Date.parse(e.target.value) <= Date.parse(start_date))) {
				e.target.value = start_date;
			}
			
			let end_date = day + '/' + month + '/' + (parseInt(year) + parseInt(update_package.insurancePackageInfo.durationOfInsurance))
			
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.ngay_hl = start_value;
				update_package.insurancePackageInfo.ngay_kt = end_date;
				await fee_calculator();
			}, 100);
		});
		
		return div;
	}
	
	async function step_2(params) {
		let {buyer_info, beneficiary, insurance_package_info} = params
		
		let div = create_element('div');
		div.innerHTML = `
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14 mb-14">
				<div>
					<span class="label required">Người mua bảo hiểm</span>
					<input type="text" placeholder="Họ & tên" class="input" value="${buyer_info.fullName}" name="buyer_name" required>
				</div>
				<div>
					<span class="label required">Email</span>
					<input type="text" placeholder="Email" class="input" value="${buyer_info.email || ''}" name="buyer_email" required>
				</div>
				<div>
					<span class="label required">SĐT</span>
					<input type="text" placeholder="SĐT" class="input" value="${buyer_info.phone || ''}" name="buyer_phone_number" required>
				</div>
				<!--
				<div>
					<span class="label requried">Tỉnh thành</span>
					<select class="select" name="province" required>
						
					</select>
				</div>
				-->
			</div>
			<div class="grid grid-md-4 gap-14">
				<div>
					<span class="label required">Tên chủ xe theo đăng ký</span>
					<input type="text" placeholder="Họ & tên" class="input" value="${beneficiary.fullName}" name="beneficiary_name" required>
				</div>
				<div style="grid-column: 2 / 5">
					<span class="label required">Địa chỉ theo đăng ký</span>
					<input type="text" placeholder="Địa chỉ" class="input" value="${beneficiary.address}" name="beneficiary_address" required>
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 0;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<span class="label">Biển kiểm soát</span>
					<input type="text" placeholder="Biển kiểm soát" class="input" value="${insurance_package_info.licensePlate || ''}" name="lisence_plate">
				</div>
				<div>
					<span class="label">Số khung</span>
					<input type="text" placeholder="Số khung" class="input" value="${insurance_package_info.frameNumber || ''}" name="frame_number">
				</div>
				<div>
					<span class="label">Số máy</span>
					<input type="text" placeholder="Số máy" class="input" value="${insurance_package_info.machineNumber || ''}" name="machine_number">
				</div>
			</div>
		</div>
		`;
		
		div.querySelector('[name="buyer_name"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.buyer.fullName = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="buyer_email"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.buyer.email = e.target.value;
			}, 100);
		}); 
		
		div.querySelector('[name="buyer_phone_number"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.buyer.phone = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="beneficiary_name"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.beneficiary.fullName = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="beneficiary_address"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.beneficiary.address = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="lisence_plate"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.licensePlate = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="machine_number"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.machineNumber = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="frame_number"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.frameNumber = e.target.value;
			}, 100);
		});
		
		return div;
	}
	
	async function handle_after_update(params) {
		current_order = {...params};
		let {data} = current_order;
		let {beneficiary} = current_order.data;
		let insurance_package_info = JSON.parse(data.insurancePackageInfo);
		let buyer_info = JSON.parse(data.buyerInfo);
		update_package.totalAmount = data.totalAmount;
		
		template.innerHTML = '';
		template.appendChild(await order_info({
			data: data,
			insurance_package_info: insurance_package_info
		}));
		template.appendChild(await step_1(insurance_package_info));
		template.appendChild(await step_2({
			insurance_package_info: insurance_package_info,
			buyer_info: buyer_info,
			beneficiary: beneficiary
		}));
		template.appendChild(await page_footer(data));
	}
	
	async function page_footer(params) {
		let {status} = params;
		let div = create_element('div');
		div.classList.add('text-right');
		div.innerHTML = `
		<button onclick="location.href = '/dashboard/sale-history'" class="btn btn-secondary mr-6">Quay lại</button>
		${status.toLowerCase() !== 'success' ? '<button type="button" class="btn btn-primary">Cập nhật</button>' : ''}
		`;
		
		let update_btn = div.querySelector('.btn-primary');
		if (update_btn) {
			update_btn.addEventListener('click', async () => {
				let update_request = {
					method: 'POST',
					url: bhdt_api + api_end_point.contract + '/update/' + params.order_id,
					body: update_package,
					auth: user_local_storage.user,
					api_key: user_local_storage.api_key,
					show_message: true,
					async callback(params) {
						await handle_after_update(params)
					}
				}
				await fetch_data(update_request);
			});
		}
		
		return div;
	}
	
	template.appendChild(await order_info({
		data: data,
		insurance_package_info: insurance_package_info
	}));
	template.appendChild(await step_1(insurance_package_info));
	template.appendChild(await step_2({
		insurance_package_info: insurance_package_info,
		buyer_info: buyer_info,
		beneficiary: beneficiary
	}));
	template.appendChild(await page_footer(data));
	
	return template;
}