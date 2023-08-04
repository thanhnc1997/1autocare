import {
	create_element,
	render_icon,
	get_current_date,
	format_date,
	get_local_storage,
	set_local_storage,
	remove_local_storage,
	bhdt_api,
	api_end_point,
	fetch_data,
	format_price,
	input_required_check,
	loader,
	remove_loader,
	toast,
	url_callback,
	login_as_guest,
	checkbox_toggle,
	check_expried_token
} from '../../helper.js';

import modal from '../../components/modal.js';

let icon_settings = {
	arrow_left: {
		width: 18,
		height: 10,
		fill: '#333',
		stroke_width: 1.5
	},
	arrow_right: {
		width: 18,
		height: 10,
		fill: '#fff',
		stroke_width: 1.5
	},
	circle_warning: {
		width: 14,
		height: 14,
		fill: '#856404',
		stroke_width: 1.5
	}
}

let vehicle_type = {
	GTF_XEMAY_4: {
		name: 'Mô tô 2 bánh trên 50cc'
	},
	GTF_XEMAY_5: {
		name: 'Mô tô 2 bánh từ 50cc trở xuống'
	},
	GTF_XEMAY_3: {
		name: 'Xe máy điện'
	},
	GTF_XEMAY_2: {
		name: 'Mô tô 3 bánh'
	}
}

let responsibility_value = {
	XEMAY_0M: {
		name: '0 triệu'
	},
	XEMAY_10M: {
		name: '10 triệu'
	},
	XEMAY_15M: {
		name: '15 triệu'
	},
	XEMAY_20M: {
		name: '20 triệu'
	},
	XEMAY_25M: {
		name: '25 triệu'
	},
	XEMAY_30M: {
		name: '30 triệu'
	}
}

let insurance_period = ['1', '2', '3'];

let modal_settings = {
	id: 'confirm_modal',
	overlay_close: true,
	modal_template: {
		body: {
			html: `
			<h3 class="mb-14">Bạn cần <span class="text-primary cursor-pointer">đăng nhập</span> hoặc <span class="text-danger">mua ẩn danh</span> để xem thông tin chi tiết</h3>
			<p class="text-secondary">
				<em>(*) Khi mua ẩn danh, hệ thống sẽ tạo ra <span style="color: #000; font-weight: 500;">01 tài khoản khách</span><br> và gửi thông tin đăng nhập cho bạn sau khi kết thúc việc hoàn thành đơn hàng</em>
			</p>
			`
		},
		footer: {
			html: `
			<div class="text-right">
				<button type="button" id="other" class="btn btn-outline-cyan mr-8">Mua ẩn danh</button>
				<button type="button" id="ok" class="btn btn-cyan">Đăng nhập</button>
			</div>
			`
		}
	},
	async okay(params) {
		let sign_in_modal = await import('../../components/sign_in_modal.js');
		document.body.appendChild(await sign_in_modal.render());
		document.body.classList.add('overflow-hidden');
		await sign_in_modal.callback();
	},
	async other(params) {
		document.body.classList.remove('overflow-hidden');
		await login_as_guest();
	}
}

let radio_1 = true,
		radio_2 = false;

let current_date = get_current_date(),
		current_start_date_d = current_date.split('-')[2],
		current_start_date_m = current_date.split('-')[1],
		current_start_date_y = current_date.split('-')[0],
		current_start_date = current_start_date_d + '/' + current_start_date_m + '/' + current_start_date_y,
		current_end_date = current_start_date_d + '/' + current_start_date_m + '/' + (parseInt(current_start_date_y) + 1);

let fee_charge = {
	action: 'Get_Phi_XeMay_TNDS_MIC',
	providerCode: 'MIC',
	typeInsurance: '',
	motoCompulsory: {
		vehicleType: '',
		ngay_hl: current_start_date,
		ngay_kt: current_end_date,
		durationOfInsurance: '1',
		accidentInsurancePrice: '',
		accidentInsurance: true,
		anPhi: false
	}
}

let insurance = {
	action: 'Get_Phi_XeMay_TNDS_MIC',
	providerCode: 'MIC',
	typeInsurance: '',
	buyer: {
		fullName: '',
		phone: '',
		email: '',
		citizenCode: '',
		provinceCode: '01'
	},
	beneficiary: {
		fullName: '',
		address: '',
		description: '',
		phone: '',
		email: '',
		provinceCode: '01'
	},
	insurancePackageInfo: {
		vehicleType: '',
		ngay_hl: current_start_date,
		ngay_kt: current_end_date,
		durationOfInsurance: '1',
		accidentInsurancePrice: '',
		accidentInsurance: true,
		anPhi: false,
		totalPriceInsurance: '',
		chkNotLicensePlate: '',
		frameNumber: '',
		machineNumber: '',
		licensePlate: '',
		fullNameOwner: '',
		address: ''
	},
	totalAmount: 0
}

let	typing_timer = null,
		user_local_storage = '';

if (localStorage.getItem('user')) {
	user_local_storage = await get_local_storage({name: 'user'});
}

if (localStorage.getItem('guest')) {
	user_local_storage = await get_local_storage({name: 'guest'});
}

export const render = async (params) => {
	let {typeInsurance} = params;
	fee_charge['typeInsurance'] = typeInsurance;
	insurance['typeInsurance'] = typeInsurance;
	
	let template = create_element('div');
	template.classList.add('form');
	
	async function change_step(steps) {
		let {current, next, move} = steps;
		if (!current || !next) return false;
		template.querySelector(current).remove();
		template.querySelector(`[data-id="${current}"]`).classList.remove('active');
		template.querySelector(`[data-id="${next}"]`).classList.add('active');
		setTimeout(async () => {
			await move();
		}, 100);
	}
	
	async function process_section() {
		let div = create_element('div');
		div.classList.add('process-row', 'mb-24');
		div.innerHTML = `
		<div class="d-flex">
			<div data-id="#step_1" class="item active">
				<span class="number">1</span>
				<p>Thông tin <br><span>Xe được bảo hiểm</span></p>
			</div>
			<div data-id="#step_2" class="item">
				<span class="number">2</span>
				<p>Thông tin <br><span>Người mua bảo hiểm</span></p>
			</div>
			<div data-id="#step_3" class="item">
				<span class="number">3</span>
				<p>Thông tin <br><span>Thanh toán</span></p>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function done_typing_contract_value(params) {
		let {name, obj, name_2, obj_2, name_3, obj_3, value} = params;
		if (name && obj) obj[name] = value;
		if (name_2 && obj_2) obj_2[name_2] = value;
		if (name_3 && obj_3) obj_3[name_3] = value;
	}
	
	async function fee_calculator(params) {
		let fee_calculator_request = {
			method: 'POST',
			url: bhdt_api + api_end_point.contract + '/tinh-phi',
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			body: fee_charge,
			async callback(data) {
				if (data.data.phi === null) data.data.phi = 0;
				template.querySelectorAll('.total-fee').forEach(item => {
					item.innerHTML = format_price(parseInt(data.data.phi)) + ' VND';
				});
				await remove_loader();
				insurance.totalAmount = data.data.phi;
				insurance.insurancePackageInfo.totalPriceInsurance = data.data.phi;
			}
		}
		loader();
		await fetch_data(fee_calculator_request);
	}
	
	async function step_1(params) {
		let {totalAmount, insurancePackageInfo} = params;
		let div = create_element('div');
		div.setAttribute('id', 'step_1');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<div class="row">
			<div class="col-md-3 mb-14">
				<span class="label required">Loại xe</span>
				<select class="select" name="vehicle_type" required>
					<option value="" selected>Chọn</option>
				</select>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Ngày bắt đầu</span>
				<input type="date" class="input" name="start_date" value="${get_current_date() || insurancePackageInfo['ngay_hl']}" required>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Thời hạn bảo hiểm</span>
				<select class="select" name="insurance_period" required>
					
				</select>
			</div>
		</div>

		<label for="voluntary_buying" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="voluntary_buying" type="checkbox" class="mr-6" name="toggle_2">
			<b>Tham gia bảo hiểm tai nạn lái xe và người ngồi trên xe</b>
		</label>

		<div class="row row-toggle-2" style="display: none;">
			<div class="col-md-3 mb-14">
				<span class="label">Mức trách nhiệm</span>
				<select class="select" name="responsibility_value">
					<option value="" selected>Chọn</option>
				</select>
			</div>
		</div>
		
		
		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14 total-fee">${format_price(parseInt(totalAmount)) || 0} VND</h3>
			<em class="text-secondary">(đã bao gồm VAT)</em>
		</div>
		
		<button class="btn btn-cyan mr-14">Tính phí</button>
		<button class="btn btn-primary">
			<span class="mr-6">Bước tiếp</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		
		await checkbox_toggle(div.querySelector('[name="toggle_2"]'), div.querySelector('.row-toggle-2'), 'flex');
		div.querySelector('[name="toggle_2"]').addEventListener('change', async (e) => {
			if (e.target.checked == false) {
				div.querySelector('[name="responsibility_value"]').value = '';
				fee_charge.motoCompulsory.accidentInsurancePrice = '';
				insurance.insurancePackageInfo.accidentInsurancePrice = '';
				await fee_calculator();
			}
		});
		
		for (let v of insurance_period) {
			let option = create_element('option');
			option.value = v;
			option.innerHTML = v + ' năm';
			if (option.value == insurancePackageInfo['durationOfInsurance']) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="insurance_period"]').appendChild(option);
		}
		
		for (let [k, v] of Object.entries(vehicle_type)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			if (option.value == insurancePackageInfo['vehicleType']) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="vehicle_type"]').appendChild(option);
		}
		
		for (let [k,v] of Object.entries(responsibility_value)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			if (option.value == insurancePackageInfo['accidentInsurancePrice']) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="responsibility_value"]').appendChild(option);
		}
		//
		// update fee charge
		//
		div.querySelector('[name="vehicle_type"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'vehicleType', 
					name_2: 'vehicleType', 
					value: e.target.value, 
					obj: fee_charge['motoCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('[name="responsibility_value"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'accidentInsurancePrice', 
					name_2: 'accidentInsurancePrice', 
					value: e.target.value, 
					obj: fee_charge['motoCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('[name="insurance_period"]').addEventListener('change', (e) => {
			let start_date = fee_charge['motoCompulsory']['ngay_hl'];
			let day = start_date.split('/')[0],
					month = start_date.split('/')[1],
					year = start_date.split('/')[2],
					end_date = day + '/' + month + '/' + (parseInt(year) + parseInt(e.target.value));
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'ngay_kt',
					name_2: 'ngay_kt',
					value: end_date, 
					obj: fee_charge['motoCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				done_typing_contract_value({
					name: 'durationOfInsurance',
					name_2: 'durationOfInsurance',
					value: e.target.value, 
					obj: fee_charge['motoCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				await fee_calculator();
			}, 100);
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
			
			let end_date = day + '/' + month + '/' + (parseInt(year) + parseInt(fee_charge['motoCompulsory']['durationOfInsurance']))
			
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'ngay_hl', 
					name_2: 'ngay_hl', 
					value: start_value, 
					obj: fee_charge['motoCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				done_typing_contract_value({
					name: 'ngay_kt',
					name_2: 'ngay_kt',
					value: end_date, 
					obj: fee_charge['motoCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		let next_step = div.querySelector('.btn-primary'),
				fee_btn = div.querySelector('.btn-cyan');
		
		next_step.addEventListener('click', async () => {
			if (!user_local_storage) return false;
			
			if (!insurance.totalAmount) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Bạn chưa tính phí`,
					type: 'warning'
				})
				return false;
			}
			
			let val = await input_required_check({
				dom: div
			});
			
			if (val == false) return false;
			await change_step(
				{
					current: '#step_1', 
					next: '#step_2', 
					async move() {
						template.appendChild(await step_2(insurance));
					}
				}
			);
		});
		
		fee_btn.addEventListener('click', async () => {
			if (!user_local_storage) {
				document.body.appendChild(await modal(modal_settings));
				return false;
			}
			
			let expried = await check_expried_token(user_local_storage);
			if (expried == false) return false;
			
			let val = await input_required_check({
				dom: div
			});
			
			if (val !== false) await fee_calculator();
		});
		
		return div;
	}
	
	async function step_2(params) {
		let {beneficiary, insurancePackageInfo, totalAmount} = params;
		let div = create_element('div');
		div.setAttribute('id', 'step_2');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<!--
		<label for="use_paper_1" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_1" type="checkbox" class="mr-6">
			<b>Dùng ảnh giấy đăng ký xe để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image_1">
				</div>
			</div>
			<div class="mb-14">
				<span class="label required">Ảnh mặt sau</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="back_image_1">
				</div>
			</div>
		</div>
		-->
		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Tên chủ xe đăng ký</span>
				<input class="input" type="text" name="beneficiary_full_name" placeholder="Tên chủ xe đăng ký" value="${beneficiary['fullName']}" required>
			</div>
			<div class="col-md-8 mb-14">
				<span class="label required">Địa chỉ đăng ký</span>
				<input class="input" type="text" name="beneficiary_address" placeholder="Địa chỉ đăng ký" value="${beneficiary['address']}" required>
			</div>
		</div>

		<div class="d-flex align-items-center mb-14">
			<label for="motor_type_1" class="label cursor-pointer d-flex align-items-center mr-14">
				<input id="motor_type_1" class="mr-6" type="radio" name="motor_type" ${radio_1 == true ? 'checked' : ''}>
				<span>Xe đã có biển kiểm soát</span>
			</label>
			<label for="motor_type_2" class="label cursor-pointer d-flex align-items-center">
				<input id="motor_type_2" class="mr-6" type="radio" name="motor_type" ${radio_2 == true ? 'checked' : ''}>
				<span>Xe chưa có biển kiểm soát</span>
			</label>
		</div>

		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label">Biển kiểm soát</span>
				<input type="text" class="input" name="license_plate" placeholder="Biển kiểm soát" value="${insurancePackageInfo['licensePlate']}">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label">Số khung</span>
				<input type="text" class="input" name="frame_number" placeholder="Số khung" value="${insurancePackageInfo['frameNumber']}">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label">Số máy</span>
				<input type="text" class="input" name="machine_number" placeholder="Số máy" value="${insurancePackageInfo['machineNumber']}">
			</div>
		</div>

		<p class="mb-14 text-secondary"><em>(*)Bắt buộc cần điền ít nhất 1 trường thông tin</em><p>
		
		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14 total-fee">${format_price(parseInt(totalAmount)) || 0} VND</h3>
			<em class="text-secondary">(đã bao gồm VAT)</em>
		</div>
		
		<button class="btn btn-secondary mr-14">
			${render_icon.arrow_left(icon_settings.arrow_left)} 
			<span class="ml-6">Quay lại</span>
		</button>
		<button class="btn btn-primary">
			<span class="mr-6">Bước tiếp</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		//
		// update insurance
		//
		let license_plate = div.querySelector('[name="license_plate"]'),
				frame_number = div.querySelector('[name="frame_number'),
				machine_number = div.querySelector('[name="machine_number"]')
		
		div.querySelector('[name="beneficiary_full_name"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'fullName',  
					value: e.target.value, 
					obj: insurance['beneficiary'],
					name_2: 'fullNameOwner',
					obj_2: insurance.insurancePackageInfo
				});
			}, 100);
		});
		
		div.querySelector('[name="beneficiary_address"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'address',  
					value: e.target.value, 
					obj: insurance['beneficiary'],
					name_2: 'address',
					obj_2: insurance.insurancePackageInfo
				});
			}, 100);
		});
		
		license_plate.addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'licensePlate',  
					value: e.target.value, 
					obj: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		frame_number.addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'frameNumber',  
					value: e.target.value, 
					obj: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		machine_number.addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'machineNumber',  
					value: e.target.value, 
					obj: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		let radios = div.querySelectorAll('input[type="radio"]')
		
		function check_license_plate(e) {
			if (e.checked && e.getAttribute('id') === 'motor_type_2') {
				license_plate.disabled = true;
			}
			else {
				license_plate.disabled = false;
			}
			
			radio_1 = !radio_1;
			radio_2 = !radio_2;
		}
		radios.forEach(radio => {
			check_license_plate(radio);
			
			radio.addEventListener('change', (e) => {
				check_license_plate(e.target);
			})
		});
		
		let next_step = div.querySelector('.btn-primary'),
				previous_step = div.querySelector('.btn-secondary');
		
		previous_step.addEventListener('click', async () => {
			change_step(
				{
					current: '#step_2', 
					next: '#step_1', 
					async move() {
						template.appendChild(await step_1(insurance));
					}
				}
			);
		});
		
		next_step.addEventListener('click', async () => {
			if (license_plate.value == '' && machine_number.value == '' && frame_number.value == '') {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Số khung, số máy hoặc biển kiểm soát không được để trống`,
					type: 'warning'
				})
				return false;
			}
			
			let val = await input_required_check({
				dom: div
			});
			
			if (val == false) return false;
			await change_step(
				{
					current: '#step_2', 
					next: '#step_3',
					async move() {
						template.appendChild(await step_3(insurance));
					}
				}
			);
		});
		
		return div;
	}
	/*
	async function get_all_province(params, dom) {
		params.datas.map(item => {
			let {code, mainName} = item;
			let option = create_element('option');
			option.value = code;
			option.innerHTML = mainName;
			if (code == insurance['beneficiary']['provinceCode']) {
				option.setAttribute('selected', true);
			}
			
			dom.querySelector('[name="province"]').appendChild(option);
		});
	}
	*/
	async function redirect_payment_page() {
		location.href = url_callback;
	}
	
	let login_request = {
		url: bhdt_api + api_end_point.login,
		method: 'POST',
		auth: '',
		body: {},
		async callback(params) {
			let {token, username, apiKey} = params.data;
			await set_local_storage({
				name: 'user',
				value: {
					user: token,
					name: username,
					api_key: apiKey
				},
				async callback() {
					await remove_local_storage({name: 'guest'})
					await redirect_payment_page();
				}
			});
		}
	}
	
	async function create_contract() {
		let create_contract_request = {
			method: 'POST',
			url: bhdt_api + api_end_point.contract + '/tao-don',
			body: insurance,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				await remove_loader();
				await set_local_storage({
					name: 'payment',
					value: {
						data: insurance,
						res: params
					}
				});
				if (!params.data.customer) return false;
				let {username, password, newCustomer} = params.data.customer;
				if (newCustomer == true) {
					login_request.body = {
						username: username,
						password: password
					}
					await fetch_data(login_request);
				}
				
				if (newCustomer == false) {
					await remove_local_storage({name: 'guest'})
					await redirect_payment_page(insurance);
				}
			}
		}
		await fetch_data(create_contract_request);
	}
	
	async function step_3(params) {
		let {buyer, beneficiary, insurancePackageInfo, totalAmount} = params;
		let div = create_element('div');
		div.setAttribute('id', 'step_3');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<!--
		<label for="use_paper_2" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_2" type="checkbox" class="mr-6">
			<b>Dùng ảnh CMT/CCCD để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image_2">
				</div>
			</div>
			<div class="mb-14">
				<span class="label required">Ảnh mặt sau</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="back_image_2">
				</div>
			</div>
		</div>
		-->
		<div class="row">
			<div class="col-md-3 mb-14">
				<span class="label required">Tên người mua</span>
				<input type="text" class="input" name="buyer_full_name" placeholder="Họ & tên" required value="${buyer['fullName']}">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">SĐT</span>
				<input type="tel" class="input phone-check" name="buyer_phone_number" placeholder="SĐT" required value="${beneficiary['phone']}">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label">Email</span>
				<input type="email" class="input" name="buyer_email" placeholder="Email" value="${beneficiary['email']}">
			</div>
		</div>

		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14 total-fee">${format_price(parseInt(totalAmount)) || 0} VND</h3>
			<em class="text-secondary">(đã bao gồm VAT)</em>
		</div>

		<button class="btn btn-secondary mr-14">
			${render_icon.arrow_left(icon_settings.arrow_left)} 
			<span class="ml-6">Quay lại</span>
		</button>
		<button class="btn btn-primary">
			<span class="mr-6">Hoàn tất</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		/*
		let get_all_province_request = {
			method: 'POST',
			url: bhdt_api + api_end_point.province + '?countryCode=VNM&crPage=1&key=&maxRow=100',
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			body: {},
			async callback(params) {
				await get_all_province(params, div);
			}
		}
		if (user_local_storage)await fetch_data(get_all_province_request);
		//
		// update insurance
		//
		div.querySelector('[name="province"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'provinceCode',  
					name_2: 'provinceCode',  
					value: e.target.value, 
					obj: insurance['buyer'],
					obj_2: insurance['beneficiary']
				});
			}, 100);
		});
		*/
		div.querySelector('[name="buyer_full_name"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'fullName',
					value: e.target.value, 
					obj: insurance['buyer']
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_phone_number"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'phone',  
					name_2: 'phone',  
					value: e.target.value, 
					obj: insurance['buyer'],
					obj_2: insurance['beneficiary']
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_email"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'email',  
					name_2: 'email',  
					value: e.target.value, 
					obj: insurance['buyer'],
					obj_2: insurance['beneficiary']
				});
			}, 100);
		});
		
		let previous_step = div.querySelector('.btn-secondary'),
				completed_btn = div.querySelector('.btn-primary');
		
		previous_step.addEventListener('click', async () => {
			change_step(
				{
					current: '#step_3', 
					next: '#step_2',
					async move() {
						template.appendChild(await step_2(insurance));
					}
				}
			);
		});
		
		completed_btn.addEventListener('click', async () => {
			let val = await input_required_check({
				dom: div
			});
			
			if (val == false) return false;
			await loader();
			await create_contract();
		});
		/*
		checkbox_toggle(div.querySelector('input[type="checkbox"]'), div.querySelector('.image-row'), 'flex');
		*/
		return div;
	}
	
	template.appendChild(await process_section());
	template.appendChild(await step_1(insurance));
	
	return template;
}