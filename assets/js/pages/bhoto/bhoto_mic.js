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
	checkbox_toggle,
	url_callback,
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

let responsibility_value = {
	GFT_OTO_TL10: {
		name: '10 triệu'
	},
	GFT_OTO_TL20: {
		name: '20 triệu'
	},
	GFT_OTO_TL30: {
		name: '30 triệu'
	},
	GFT_OTO_TL40: {
		name: '40 triệu'
	},
	GFT_OTO_TL50: {
		name: '50 triệu'
	}
}

let responsibility_value_2 = {
	GFT_OTO_TK10: {
		name: '10 triệu'
	},
	GFT_OTO_TK20: {
		name: '20 triệu'
	},
	GFT_OTO_TK30: {
		name: '30 triệu'
	},
	GFT_OTO_TK40: {
		name: '40 triệu'
	},
	GFT_OTO_TK50: {
		name: '50 triệu'
	}
}

let current_date = get_current_date(),
		current_start_date_d = current_date.split('-')[2],
		current_start_date_m = current_date.split('-')[1],
		current_start_date_y = current_date.split('-')[0],
		current_start_date = current_start_date_d + '/' + current_start_date_m + '/' + current_start_date_y,
		current_end_date = current_start_date_d + '/' + current_start_date_m + '/' + (parseInt(current_start_date_y) + 1);

let intended_body = {
	code: '',
	titleSystem: '',
	titleOcr: '',
	status: 1,
	typeCate: '',
	providerCodes: 'MIC',
	parentCode: '',
}

let fee_charge = {
	action: 'Get_Phi_OTO_TNDS_MIC',
	providerCode: 'MIC',
	typeInsurance: '',
	carCompulsory: {
		intendedUse: '',
		typeIntendedUse: 'True',
		seatNumber: 1,
		vehicleType: '',
		vehicleSeries: '',
		typeDrivingPracticeCar: false,
		durationOfInsurance: '1',
		checkSitOnCar: false,
		numberOfPeopleInsured: 0,
		priceInsurance: '',
		priceInsuranceSeatOnCar: '',
		manufactureYear: '',
		trongTai: '',
		ngay_hl: current_start_date,
		ngay_kt: current_end_date,
		manufacturer: '',
		voluntarily: false
	}
}

let insurance = {
	action: 'Get_Phi_OTO_TNDS_MIC',
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
		intendedUse: '',
		typeIntendedUse: 'True',
		seatNumber: 1,
		vehicleType: '',
		vehicleSeries: '',
		typeDrivingPracticeCar: false,
		durationOfInsurance: '1',
		checkSitOnCar: false,
		numberOfPeopleInsured: 0,
		priceInsurance: '',
		priceInsuranceSeatOnCar: '',
		manufactureYear: '',
		trongTai: '',
		ngay_hl: current_start_date,
		ngay_kt: current_end_date,
		manufacturer: '',
		voluntarily: false,
		chkNotLicensePlate: true,
		address: '',
		fullNameOwner: ''
	},
	totalAmount: ''
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
		let {current, next} = steps;
		if (current) {
			template.querySelector(`[data-id="${current}"]`).classList.remove('active');
			template.querySelector(current).classList.remove('show');
		}
		if (next) {
			template.querySelector(`[data-id="${next}"]`).classList.add('active');
			template.querySelector(next).classList.add('show');
		}
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
			}
		}
		loader();
		await fetch_data(fee_calculator_request);
	}
	
	async function get_intended_use(div) {
		intended_body['typeCate'] = 'MDSD_AUTO';
		let get_intended_use_request = {
			method: 'POST',
			url: bhdt_api + 'category-intended-use',
			body: intended_body,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				await render_data(params, div);
			}
		}
		async function render_data(params, div) {
			params.datas.map(item => {
				let {code, titleSystem} = item;
				let option = document.createElement('option');
				option.innerHTML = titleSystem;
				option.value = code;

				div.querySelector('[name="uses"]').appendChild(option);
			});
		}
		if (user_local_storage) await fetch_data(get_intended_use_request);
	}
	
	async function get_vehicle_type(params, div) {
		intended_body['typeCate'] = 'LOAIHINH_AUTO';
		intended_body['parentCode'] = params.value;
		let get_vehicle_type_request = {
			method: 'POST',
			url: bhdt_api + 'category-intended-use',
			body: intended_body,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				await render_data(params, div);
			}
		}
		async function render_data(params, div) {
			div.querySelector('[name="vehicle_type"]').innerHTML = '<option value="">Chọn</option>';
			params.datas.map(item => {
				let {code, titleSystem} = item;
				let option = document.createElement('option');
				option.innerHTML = titleSystem;
				option.value = code;

				div.querySelector('[name="vehicle_type"]').appendChild(option);
			});
		}
		if (user_local_storage) await fetch_data(get_vehicle_type_request);
	}
	
	async function get_brands(div) {
		intended_body['typeCate'] = 'HIEUXEAUTO';
		let get_brands_request = {
			method: 'POST',
			url: bhdt_api + 'category-intended-use?maxRow=1000&crPage=1',
			body: intended_body,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				let dropdown = await import('../../components/search_dropdown.js');
				div.appendChild(await dropdown.render({
					data: params,
					callback_1() {
						loader();
						get_brands_value();
					}
				}));
			}
		}
		
		async function get_brands_value() {
			let data_code = div.querySelector('.placeholder').getAttribute('data-code');
			div.querySelector('[name="brands"]').value = data_code;
			fee_charge.carCompulsory.manufacture = data_code;
			insurance.insurancePackageInfo.manufacturer = data_code;
			
			await get_vehicle_series({value: data_code}, template.querySelector('[name="series"]'));
		}
		
		if (user_local_storage) await fetch_data(get_brands_request);
	}
	
	async function get_vehicle_series(params, div) {
		intended_body['typeCate'] = 'DONGXE';
		intended_body['parentCode'] = params.value;
		let get_vehicle_series_request = {
			method: 'POST',
			url: bhdt_api + 'category-intended-use?crPage=1&maxRow=1000',
			body: intended_body,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				await remove_loader();
				await render_data(params, div);
			}
		}
		async function render_data(params, div) {
			div.innerHTML = '<option value="">Chọn</option>';
			await remove_loader();
			params.datas.map(item => {
				let {code, titleSystem} = item;
				let option = document.createElement('option');
				option.innerHTML = titleSystem;
				option.value = code;

				div.appendChild(option);
			});
		}
		if (user_local_storage) await fetch_data(get_vehicle_series_request);
	}
	
	async function step_1() {
		let div = create_element('div');
		div.setAttribute('id', 'step_1');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<!--
		<label for="use_paper_1" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_1" type="checkbox" class="mr-6" name="toggle_1">
			<b>Dùng ảnh giấy đăng kiểm xe để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row image-row-1" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image_1">
				</div>
			</div>
		</div>
		-->
		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Loại hình</span>
				<select class="select" name="bussiness_type">
					<option value="True" selected>Kinh doanh</option>
					<option value="False">Không kinh doanh</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Mục đích sử dụng</span>
				<select class="select" name="uses">
					<option value="" selected>Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Loại xe</span>
				<select class="select" name="vehicle_type">
					<option value="">Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14 brands">
				<span class="label">Hãng sản xuất</span>
				<input name="brands" type="hidden" required>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Dòng xe</span>
				<select class="select" name="series">
					<option value="" selected required>Chọn</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Năm sản xuất</span>
				<input type="tel" class="input" name="released" placeholder="Năm sản xuất" required>
			</div>

			<div class="col-md-3 mb-14">
				<span class="label required">Số chỗ ngồi</span>
				<input type="text" class="input" name="seats" placeholder="Số chỗ" value="${fee_charge['carCompulsory']['seatNumber']}">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label">Tải trọng (tấn)</span>
				<input type="text" class="input" name="weight" placeholder="Tải trọng" disabled>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Ngày bắt đầu mua</span>
				<input type="date" class="input" name="start_date" value="${get_current_date()}" required>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Thời hạn bảo hiểm</span>
				<select class="select" name="insurance_period" required>
					<option value="1" selected>1 năm</option>
					<option value="2">2 năm</option>
				</select>
			</div>
		</div>

		<label for="voluntary_buying" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="voluntary_buying" type="checkbox" class="mr-6" name="toggle_2">
			<b>Mua tự nguyện (Tai nạn lái, phụ xe & người ngồi trên xe)</b>
		</label>

		<div class="row row-toggle-2" style="display: none;">
			<div class="col-6 col-md-3 mb-14">
				<span class="label">Số người lái (phụ xe)</span>
				<input type="tel" class="input" name="drivers_number" placeholder="Số người lái">
			</div>
			<div class="col-6 col-md-3 mb-14">
				<span class="label">Mức tai nạn người lái (phụ xe)</span>
				<select class="select" name="responsibility_value"></select>
			</div>
			<div class="col-6 col-md-3 mb-14">
				<span class="label">Số người ngồi trên xe</span>
				<input type="tel" class="input" name="seats_number" placeholder="Số người ngồi trên xe" disabled>
			</div>
			<div class="col-6 col-md-3 mb-14">
				<span class="label">Mức tai nạn người ngồi trên xe</span>
				<select class="select" name="responsibility_value_2"></select>
			</div>
		</div>
		
		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14 total-fee">0 VND</h3>
			<em class="text-secondary">(đã bao gồm VAT)</em>
		</div>
		
		<button class="btn btn-cyan mr-14">Tính phí</button>
		<button class="btn btn-primary">
			<span class="mr-6">Bước tiếp</span>
			${render_icon.arrow_right(icon_settings.arrow_right)}
		</button>
		`;
		let radios = div.querySelectorAll('input[type="radio"]');
		
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
			
			await change_step({current: '#step_1', next: '#step_2'});
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
		
		await get_intended_use(div);
		await get_brands(div.querySelector('.brands'));
		
		for (let [k,v] of Object.entries(responsibility_value)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			
			div.querySelector('[name="responsibility_value"]').appendChild(option);
		}
		
		for (let [k,v] of Object.entries(responsibility_value_2)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			
			div.querySelector('[name="responsibility_value_2"]').appendChild(option);
		}
		
		div.querySelector('[name="bussiness_type"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'typeIntendedUse', 
					name_2: 'typeIntendedUse', 
					value: e.target.value, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		div.querySelector('[name="uses"]').addEventListener('change', async (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'intendedUse', 
					name_2: 'intendedUse', 
					value: e.target.value, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
			
			await get_vehicle_type({value: e.target.value}, div);
			let weight_input = div.querySelector('[name="weight"]');
			
			if (e.target.value === 'GFT_MDSD_NH' || e.target.value === 'GFT_MIC_N') {
				weight_input.removeAttribute('requried');
				weight_input.parentElement.querySelector('.label').classList.remove('required');
			}
			
			if (e.target.value === 'GFT_MDSD_NH' || e.target.value === 'GFT_MDSD_HH') {
				weight_input.removeAttribute('disabled');
			}
			
			if (e.target.value === 'GFT_MIC_N') {
				weight_input.setAttribute('disabled', 'disabled');
			}
			
			if (e.target.value === 'GFT_MDSD_HH') {
				weight_input.setAttribute('requried', true);
				weight_input.parentElement.querySelector('.label').classList.add('required');
			}
		});
		
		div.querySelector('[name="vehicle_type"]').addEventListener('change', async (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'vehicleType', 
					name_2: 'vehicleType', 
					value: e.target.value, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		/*
		div.querySelector('[name="brands"]').addEventListener('change', async (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'manufacturer', 
					name_2: 'manufacturer', 
					value: e.target.querySelector('option:checked').textContent, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
			await loader();
			await get_vehicle_series({value: e.target.value}, div);
		});
		*/
		div.querySelector('[name="series"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'vehicleSeries', 
					name_2: 'vehicleSeries', 
					value: e.target.querySelector('option:checked').textContent, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		div.querySelector('[name="released"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'manufactureYear', 
					name_2: 'manufactureYear', 
					value: e.target.value, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		div.querySelector('[name="weight"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'trongTai', 
					name_2: 'trongTai', 
					value: e.target.value, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
			}, 100);
		});
		
		div.querySelector('[name="seats"]').addEventListener('input', (e) => {
			let value = e.target.value,
					input_4 = div.querySelector('[name="seats_number"]'),
					seats = 0;
			if (parseFloat(fee_charge['carCompulsory']['numberOfPeopleInsured'])) {
				seats = parseFloat(value) - parseFloat(fee_charge['carCompulsory']['numberOfPeopleInsured']);
				if (seats <= 0) seats = 0;
				input_4.value = seats;
			}
			
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'seatNumber', 
					name_2: 'seatNumber', 
					value: parseInt(e.target.value), 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('[name="start_date"]').addEventListener('change', (e) => {
			let day = e.target.value.split('-')[2],
					month = e.target.value.split('-')[1],
					year = e.target.value.split('-')[0],
					start_value = day + '/' + month + '/' + year;
			
			let start_date = get_current_date();
			if ((Date.parse(e.target.value) <= Date.parse(start_date))) {
				e.target.value = start_date;
			}
			
			let end_date = day + '/' + month + '/' + (parseInt(year) + parseInt(fee_charge['carCompulsory']['durationOfInsurance']))
			
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'ngay_hl', 
					name_2: 'ngay_hl', 
					value: start_value, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				done_typing_contract_value({
					name: 'ngay_kt',
					name_2: 'ngay_kt',
					value: end_date, 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('[name="insurance_period"]').addEventListener('change', (e) => {
			let start_date = fee_charge['carCompulsory']['ngay_hl'];
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
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				done_typing_contract_value({
					name: 'durationOfInsurance',
					name_2: 'durationOfInsurance',
					value: (e.target.value).toString(), 
					obj: fee_charge['carCompulsory'],
					obj_2: insurance['insurancePackageInfo']
				});
				
				await fee_calculator();
			}, 100);
		});
		/*
		await checkbox_toggle(div.querySelector('input[name="toggle_1"]'), div.querySelector('.image-row-1'), 'flex');
		*/
		await checkbox_toggle(div.querySelector('[name="toggle_2"]'), div.querySelector('.row-toggle-2'), 'flex');
		div.querySelector('[name="toggle_2"]').addEventListener('change', async (e) => {
			let input_1 = div.querySelector('[name="drivers_number"]'),
					input_2 = div.querySelector('[name="responsibility_value"]'),
					input_3 = div.querySelector('[name="responsibility_value_2"]'),
					input_4 = div.querySelector('[name="seats_number"]'),
					input_5 = div.querySelector('[name="seats"]');
			
			fee_charge['carCompulsory']['voluntarily'] = e.target.checked;
			insurance['insurancePackageInfo']['voluntarily'] = e.target.checked;
			
			fee_charge['carCompulsory']['voluntarily'] = e.target.checked;
			insurance['insurancePackageInfo']['voluntarily'] = e.target.checked;
			fee_charge['carCompulsory']['checkSitOnCar'] = e.target.checked;
			insurance['insurancePackageInfo']['checkSitOnCar'] = e.target.checked;
					
			if (e.target.checked == true) {
				input_1.parentElement.querySelector('.label').classList.add('required');
				input_2.parentElement.querySelector('.label').classList.add('required');
				input_3.parentElement.querySelector('.label').classList.add('required');
				
				input_1.setAttribute('required', true);
				input_2.setAttribute('required', true);
				input_3.setAttribute('required', true);
				
				fee_charge['carCompulsory']['numberOfPeopleInsured'] = 0;
				insurance['insurancePackageInfo']['numberOfPeopleInsured'] = 0;
				fee_charge['carCompulsory']['priceInsurance'] = 'GFT_OTO_TL10';
				fee_charge['carCompulsory']['priceInsuranceSeatOnCar'] = 'GFT_OTO_TK10';
				insurance['insurancePackageInfo']['priceInsurance'] = 'GFT_OTO_TL10';
				insurance['insurancePackageInfo']['priceInsuranceSeatOnCar'] = 'GFT_OTO_TK10';
				
				input_2.value = 'GFT_OTO_TL10';
				input_3.value = 'GFT_OTO_TK10';
				input_2.querySelector('option').setAttribute('selected', true);
				input_3.querySelector('option').setAttribute('selected', true);
				
				input_1.value = 1;
				input_4.value = parseFloat(fee_charge['carCompulsory']['seatNumber']) - parseFloat(input_1.value);
				fee_charge['carCompulsory']['so_nguoi_ngoi_tren_xe'] = parseInt(input_4.value);
				insurance['insurancePackageInfo']['so_nguoi_ngoi_tren_xe'] = parseInt(input_4.value);
				await fee_calculator();
				
				input_1.addEventListener('input', (e) => {
					let value = e.target.value;
					/*
					if (parseFloat(value) > parseFloat(fee_charge['carCompulsory']['seatNumber'])) {
						toast({
							message: `${render_icon.circle_warning(icon_settings.circle_warning)} Số lái phụ vượt quá số chỗ ngồi`,
							type: 'warning'
						});
						return false;
					}
					*/
					if (parseFloat(value) > 2) {
						e.target.value = 2;
						value = 2;
					}
					
					input_4.value = parseFloat(fee_charge['carCompulsory']['seatNumber']) - parseFloat(value);
					
					clearTimeout(typing_timer);
					typing_timer = setTimeout(() => {
						done_typing_contract_value({
							name: 'numberOfPeopleInsured', 
							name_2: 'numberOfPeopleInsured', 
							value: parseInt(value), 
							obj: fee_charge['carCompulsory'],
							obj_2: insurance['insurancePackageInfo']
						});
						
						done_typing_contract_value({
							name: 'so_nguoi_ngoi_tren_xe', 
							name_2: 'so_nguoi_ngoi_tren_xe', 
							value: parseInt(input_4.value), 
							obj: fee_charge['carCompulsory'],
							obj_2: insurance['insurancePackageInfo']
						});
					}, 100);
				});
				
				input_2.addEventListener('change', (e) => {
					clearTimeout(typing_timer);
					typing_timer = setTimeout(async () => {
						done_typing_contract_value({
							name: 'priceInsurance', 
							name_2: 'priceInsurance', 
							value: e.target.value, 
							obj: fee_charge['carCompulsory'],
							obj_2: insurance['insurancePackageInfo']
						});
						
						await fee_calculator();
					}, 100);
				});
				
				input_3.addEventListener('change', (e) => {
					clearTimeout(typing_timer);
					typing_timer = setTimeout(async () => {
						done_typing_contract_value({
							name: 'priceInsuranceSeatOnCar', 
							name_2: 'priceInsuranceSeatOnCar', 
							value: e.target.value, 
							obj: fee_charge['carCompulsory'],
							obj_2: insurance['insurancePackageInfo']
						});
						
						await fee_calculator();
					}, 100);
				});
			}
			
			if (e.target.checked == false) {
				input_1.parentElement.querySelector('.label').classList.remove('required');
				input_2.parentElement.querySelector('.label').classList.remove('required');
				input_2.querySelector('option').removeAttribute('selected');
				input_3.querySelector('option').removeAttribute('selected');
				
				input_1.value = '';
				input_2.value = '';
				input_3.value = '';
				input_4.value = '';
				
				input_1.removeAttribute('required');
				input_2.removeAttribute('required');
				input_3.removeAttribute('required');
				
				fee_charge['carCompulsory']['priceInsuranceSeatOnCar'] = '';
				insurance['insurancePackageInfo']['priceInsuranceSeatOnCar'] = '';
				
				fee_charge['carCompulsory']['priceInsurance'] = '';
				insurance['insurancePackageInfo']['priceInsurance'] = '';
				
				fee_charge['carCompulsory']['so_nguoi_ngoi_tren_xe'] = '';
				insurance['insurancePackageInfo']['so_nguoi_ngoi_tren_xe'] = '';
				
				fee_charge['carCompulsory']['numberOfPeopleInsured'] = 0;
				insurance['insurancePackageInfo']['numberOfPeopleInsured'] = 0;
				
				await fee_calculator();
			}
		});
		
		return div;
	}
	
	async function step_2() {
		let div = create_element('div');
		div.setAttribute('id', 'step_2');
		div.classList.add('tab-pane');
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
				<input class="input" type="text" name="beneficiary_full_name" placeholder="Tên chủ xe đăng ký">
			</div>
			<div class="col-md-8 mb-14">
				<span class="label required">Địa chỉ đăng ký</span>
				<input class="input" type="text" name="beneficiary_address" placeholder="Địa chỉ đăng ký">
			</div>
		</div>
		
		<div class="d-flex align-items-center mb-14">
			<label for="motor_type_1" class="label cursor-pointer d-flex align-items-center mr-14">
				<input id="motor_type_1" class="mr-6" type="radio" name="motor_type" checked>
				<span>Xe đã có biển kiểm soát</span>
			</label>
			<label for="motor_type_2" class="label cursor-pointer d-flex align-items-center">
				<input id="motor_type_2" class="mr-6" type="radio" name="motor_type">
				<span>Xe chưa có biển kiểm soát</span>
			</label>
		</div>

		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label">Biển kiểm soát</span>
				<input type="text" class="input" name="license_plate" placeholder="Biển kiểm soát">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label">Số khung</span>
				<input type="text" class="input" name="frame_number" placeholder="Số khung">
			</div>
			<div class="col-md-4 mb-14">
				<span class="label">Số máy</span>
				<input type="text" class="input" name="machine_number" placeholder="Số máy">
			</div>
		</div>

		<p class="mb-14 text-secondary"><em>(*)Bắt buộc cần điền ít nhất 1 trường thông tin</em><p>

		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14 total-fee">0 VND</h3>
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
		
		let radios = div.querySelectorAll('input[type="radio"]');
		
		radios.forEach(radio => {
			radio.addEventListener('change', (e) => {
				if (e.target.checked && e.target.getAttribute('id') === 'motor_type_2') {
					license_plate.disabled = true;
					license_plate.value = '';
					insurance.insurancePackageInfo.chkNotLicensePlate = true;
					insurance.insurancePackageInfo.licensePlate = '';
				}
				else {
					license_plate.disabled = false;
					insurance.insurancePackageInfo.chkNotLicensePlate = false;
				}
			})
		});
		
		let next_step = div.querySelector('.btn-primary'),
				previous_step = div.querySelector('.btn-secondary');
		
		previous_step.addEventListener('click', async () => {
			change_step({current: '#step_2', next: '#step_1'});
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
			
			if (val !== false) {
				await change_step({current: '#step_2', next: '#step_3'});
			}
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
			if (code == '01') {
				option.setAttribute('selected', true);
				insurance['buyer']['provinceCode'] = code;
				insurance['beneficiary']['provinceCode'] = code;
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
					await redirect_payment_page();
				}
			}
		}
		await fetch_data(create_contract_request);
	}
	
	async function step_3() {
		let div = create_element('div');
		div.setAttribute('id', 'step_3');
		div.classList.add('tab-pane');
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
				<input type="text" class="input" name="buyer_full_name" placeholder="Họ & tên" required>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">SĐT</span>
				<input type="tel" class="input phone-check" name="buyer_phone_number" placeholder="SĐT" required>
			</div>
			<div class="col-md-3 mb-14">
				<span class="label">Email</span>
				<input type="email" class="input" name="buyer_email" placeholder="Email">
			</div>
		</div>

		<div class="d-flex align-items-center mb-14">
			<h3 class="mr-14 total-fee">0 VND</h3>
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
		*/
		// if (user_local_storage) await fetch_data(get_all_province_request);
		//
		// update insurance
		//
		/*
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
			change_step({current: '#step_3', next: '#step_2'});
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
	template.appendChild(await step_1());
	template.appendChild(await step_2());
	template.appendChild(await step_3());
	
	return template;
}