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
	convert_timestamp,
	checkbox_toggle
} from '../../../../helper.js';

let icon_settings = {
	chevron_left: {
		width: 10,
		height: 14,
		fill: '#333',
		stroke_width: 1.5
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

let fee_charge = {
	action: 'Get_Phi_OTO_TNDS_MIC',
	providerCode: 'MIC',
	typeInsurance: 'bao-hiem-tnds-xe-oto-mic',
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
		ngay_hl: '',
		ngay_kt: '',
		manufacturer: '',
		voluntarily: false,
		so_nguoi_ngoi_tren_xe: ''
	}
}

let insurance_period = ['1', '2'];
let	typing_timer = null;
let current_order = {};

let intended_body = {
	code: '',
	titleSystem: '',
	titleOcr: '',
	status: 1,
	typeCate: '',
	providerCodes: 'MIC',
	parentCode: '',
}

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
	
	fee_charge.carCompulsory.ngay_hl = insurance_package_info.ngay_hl;
	fee_charge.carCompulsory.ngay_kt = insurance_package_info.ngay_kt;
	
	let template = create_element('div');
	template.classList.add('grid', 'gap-28');
	
	async function order_info(data) {
		let div = create_element('div');
		div.innerHTML = `
		<div class="mb-24" style="display: flex; align-items: center;">
			<span onclick="location.href = '/dashboard/sale-history'" class="btn back mr-18">
				${render_icon.chevron_left(icon_settings.chevron_left)}
			</span>
			<h4 style="font-size: 16px;">MIC - TNDS Ô tô</h4>
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
					<p class="mb-6 text-secondary">Tạo bởi</p>
					<h4>${data.createdBy}</h4>
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<p class="mb-6 text-secondary">Thanh toán</p>
					<h4>${data.hasPay == true ? '<span class="text-success">Đã thanh toán</span>' : '<span class="text-danger">Chưa thanh toán</span>'}</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Giá trị HĐ</p>
					<h4 class="total-fee">${format_price(data.totalAmount)} VND</h4>
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<p class="mb-6 text-secondary">Ngày tạo</p>
					<h4>${await convert_timestamp(data.createdAt)}</h4>
				</div>
				<div>
					<p class="mb-6 text-secondary">Cập nhật lúc</p>
					<h4>${await convert_timestamp(data.updatedAt)}</h4>
				</div>
			</div>
		</div>
		`;
		
		return div;
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
				if (code == insurance_package_info.intendedUse) option.setAttribute('selected', 'selected');

				div.querySelector('[name="uses"]').appendChild(option);
			});
		}
		
		await fetch_data(get_intended_use_request);
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
				if (code == insurance_package_info.vehicleType) option.setAttribute('selected', 'selected');

				div.querySelector('[name="vehicle_type"]').appendChild(option);
			});
		}
		if (user_local_storage) await fetch_data(get_vehicle_type_request);
	}
	
	async function get_brands(div) {
		intended_body['typeCate'] = 'HIEUXEAUTO';
		intended_body['parentCode'] = '';
		let get_brands_request = {
			method: 'POST',
			url: bhdt_api + 'category-intended-use?maxRow=1000&crPage=1',
			body: intended_body,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				render_data(params, div);
			}
		}
		function render_data(params, div) {
			params.datas.map(item => {
				let {code, titleSystem} = item;
				let option = document.createElement('option');
				option.innerHTML = titleSystem;
				option.value = code;
				if (titleSystem == insurance_package_info.manufacturer) option.setAttribute('selected', 'selected');

				div.querySelector('[name="brands"]').appendChild(option);
			});
		}
		await fetch_data(get_brands_request);
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
			div.querySelector('[name="series"]').innerHTML = '<option value="">Chọn</option>';
			await remove_loader();
			params.datas.map(item => {
				let {code, titleSystem} = item;
				let option = document.createElement('option');
				option.innerHTML = titleSystem;
				option.value = code;
				if (titleSystem == insurance_package_info.vehicleSeries) option.setAttribute('selected', 'selected');

				div.querySelector('[name="series"]').appendChild(option);
			});
		}
		await fetch_data(get_vehicle_series_request);
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
	
	async function fee_calculator(params) {
		fee_charge.carCompulsory = {...update_package['insurancePackageInfo']};
		
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
				update_package.totalAmount = data.data.phi;
			}
		}
		loader();
		await fetch_data(fee_calculator_request);
	}
	
	async function step_1(insurance_package_info) {
		let d = insurance_package_info.ngay_hl.split('/')[0],
				m = insurance_package_info.ngay_hl.split('/')[1],
				y = insurance_package_info.ngay_hl.split('/')[2];
		
		let div = create_element('div');
		div.innerHTML = `
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<span class="label requried">Ngày bắt đầu</span>
					<input type="date" class="input" name="start_date" value="${y}-${m}-${d}" required>
				</div>
				<div>
					<span class="label requried">Thời hạn bảo hiểm</span>
					<select class="select" name="insurance_period" required>
						<option value="" selected>Chọn</option>
					</select>
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14 mb-14">
				<div>
					<span class="label requried">Loại hình</span>
					<select class="select" name="bussiness_type" required>
						<option value="True" ${insurance_package_info.typeIntendedUse == 'True' ? 'selected' : ''}>Kinh doanh</option>
						<option value="False" ${insurance_package_info.typeIntendedUse == 'False' ? 'selected' : ''}>Không kinh doanh</option>
					</select>
				</div>
				<div>
					<span class="label requried">Mục đích sử dụng</span>
					<select class="select" name="uses" required>
						<option value="">Chọn</option>
					</select>
				</div>
				<div>
					<span class="label requried">Loại xe</span>
					<select class="select" name="vehicle_type" required>
						<option value="">Chọn</option>
					</select>
				</div>
			</div>
			<div class="grid grid-md-4 gap-14 mb-14">
				<div>
					<span class="label requried">Số chỗ ngồi</span>
					<input type="text" class="input" name="seats" placeholder="Số chỗ" value="${insurance_package_info.seatNumber || ''}">
				</div>
				<div>
					<span class="label">Tải trọng (tấn)</span>
					<input type="text" class="input" name="weight" placeholder="Tải trọng" value="${insurance_package_info.trongTai || ''}">
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 8px;">
			<label for="voluntary_buying" class="note cursor-pointer d-flex align-items-center mb-14">
				<input id="voluntary_buying" type="checkbox" class="mr-6" ${insurance_package_info.voluntarily === true ? 'checked' : ''}>
				<b>Mua tự nguyện (Tai nạn lái, phụ xe & người ngồi trên xe)</b>
			</label>
			<div class="toggle-2 grid grid-md-4 gap-14">
				<div>
					<span class="label requried">Số người lái (phụ xe)</span>
					<input type="tel" class="input" name="drivers_number" placeholder="Số người lái" value="${insurance_package_info.numberOfPeopleInsured || ''}">
				</div>
				<div>
					<span class="label requried">Số người ngồi trên xe</span>
					<input type="tel" class="input" name="seats_number" placeholder="Số người ngồi trên xe" value="${insurance_package_info.so_nguoi_ngoi_tren_xe || ''}" disabled>
				</div>
				<div>
					<span class="label requried">Mức tai nạn người lái (phụ xe)</span>
					<select class="select" name="responsibility_value" required="true">
						<option value="">Chọn</option>
					</select>
				</div>
				<div>
					<span class="label requried">Mức tai nạn người ngồi trên xe</span>
					<select class="select" name="responsibility_value_2" required="true">
						<option value="">Chọn</option>
					</select>
				</div>
			</div>
		</div>
		<div class="card" style="margin-bottom: 0;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<span class="label requried">Hãng sản xuất</span>
					<select class="select" name="brands" required>
						<option value="">Chọn</option>
					</select>
				</div>
				<div>
					<span class="label required">Dòng xe</span>
					<select class="select" name="series">
						<option value="" required>Chọn</option>
					</select>
				</div>
				<div>
					<span class="label required">Năm sản xuất</span>
					<input type="tel" class="input" name="released" placeholder="Năm sản xuất" value="${insurance_package_info.manufactureYear}">
				</div>
			</div>
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
		
		for (let [k,v] of Object.entries(responsibility_value)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			if (option.value == insurance_package_info.priceInsurance) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="responsibility_value"]').appendChild(option);
		}
		
		for (let [k,v] of Object.entries(responsibility_value_2)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v['name'];
			if (option.value == insurance_package_info.priceInsuranceSeatOnCar) {
				option.setAttribute('selected', true);
			}
			
			div.querySelector('[name="responsibility_value_2"]').appendChild(option);
		}
		
		await get_intended_use(div);
		await get_vehicle_type({value: insurance_package_info.intendedUse}, div);
		await get_brands(div);
		await get_vehicle_series({value: div.querySelector('[name="brands"]').value}, div);
		
		await checkbox_toggle(div.querySelector('#voluntary_buying'), div.querySelector('.toggle-2'), 'grid');
		
		div.querySelector('[name="uses"]').addEventListener('change', async (e) => {
			update_package.insurancePackageInfo.intendedUse = e.target.value;
			
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
			update_package.insurancePackageInfo.vehicleType = e.target.value;
		});
		
		div.querySelector('[name="brands"]').addEventListener('change', async (e) => {
			update_package.insurancePackageInfo.manufacturer = e.target.value;
			await get_vehicle_series({value: e.target.value}, div);
		});
		
		div.querySelector('[name="released"]').addEventListener('input', (e) => {
			update_package.insurancePackageInfo.manufactureYear = e.target.value;
		});
		
		div.querySelector('[name="weight"]').addEventListener('input', (e) => {
			update_package.insurancePackageInfo.trongTai = e.target.value;
		});
		
		div.querySelector('[name="seats"]').addEventListener('input', (e) => {
			update_package.insurancePackageInfo.seatNumber = parseInt(e.target.value);
		});
		
		div.querySelector('[name="drivers_number"]').addEventListener('input', (e) => {
			let input_4 = div.querySelector('[name="seats_number"]'),
					input_5 = div.querySelector('[name="seats"]');
			
			let value = e.target.value;
			
			if (parseFloat(value) > parseFloat(input_5.value)) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Số lái phụ vượt quá số chỗ ngồi`,
					type: 'warning'
				});
				return false;
			}
			
			input_4.value = parseFloat(input_5.value) - parseFloat(value);
					
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				fee_charge.carCompulsory.numberOfPeopleInsured = parseInt(e.target.value);
				update_package.insurancePackageInfo.numberOfPeopleInsured = parseInt(e.target.value);
				insurance_package_info.numberOfPeopleInsured = parseInt(e.target.value);

				fee_charge.carCompulsory.so_nguoi_ngoi_tren_xe = parseInt(input_4.value);
				update_package.insurancePackageInfo.so_nguoi_ngoi_tren_xe = parseInt(input_4.value);
				insurance_package_info.so_nguoi_ngoi_tren_xe = parseInt(input_4.value);

				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('#voluntary_buying').addEventListener('change', async (e) => {
			let input_1 = div.querySelector('[name="drivers_number"]'),
					input_2 = div.querySelector('[name="responsibility_value"]'),
					input_3 = div.querySelector('[name="responsibility_value_2"]'),
					input_4 = div.querySelector('[name="seats_number"]'),
					input_5 = div.querySelector('[name="seats"]');
			
			update_package.insurancePackageInfo.voluntarily = e.target.checked;
			update_package.insurancePackageInfo.checkSitOnCar = e.target.checked;
			
			if (e.target.checked == true) {
				input_1.parentElement.querySelector('.label').classList.add('required');
				input_2.parentElement.querySelector('.label').classList.add('required');
				input_3.parentElement.querySelector('.label').classList.add('required');
				
				input_1.setAttribute('required', true);
				input_2.setAttribute('required', true);
				input_3.setAttribute('required', true);
				
				fee_charge['carCompulsory']['numberOfPeopleInsured'] = insurance_package_info.numberOfPeopleInsured;
				update_package['insurancePackageInfo']['numberOfPeopleInsured'] = insurance_package_info.numberOfPeopleInsured;
				fee_charge['carCompulsory']['priceInsurance'] = insurance_package_info.priceInsurance;
				fee_charge['carCompulsory']['priceInsuranceSeatOnCar'] = insurance_package_info.priceInsuranceSeatOnCar;
				update_package['insurancePackageInfo']['priceInsurance'] = insurance_package_info.priceInsurance;
				update_package['insurancePackageInfo']['priceInsuranceSeatOnCar'] = insurance_package_info.priceInsuranceSeatOnCar;
				update_package.insurancePackageInfo.so_nguoi_ngoi_tren_xe = insurance_package_info.so_nguoi_ngoi_tren_xe;
				
				input_1.value = insurance_package_info.numberOfPeopleInsured;
				input_2.value = insurance_package_info.priceInsurance;
				input_3.value = insurance_package_info.priceInsuranceSeatOnCar;
				input_2.querySelector(`option[value="${insurance_package_info.priceInsurance}"]`).setAttribute('selected', true);
				input_3.querySelector(`option[value="${insurance_package_info.priceInsuranceSeatOnCar}"]`).setAttribute('selected', true);
				
				input_1.value = insurance_package_info.numberOfPeopleInsured;
				input_4.value = insurance_package_info.so_nguoi_ngoi_tren_xe;
				await fee_calculator();
				
				input_1.addEventListener('input', (e) => {
					let value = e.target.value;
					
					if (parseFloat(value) > parseFloat(input_5.value)) {
						toast({
							message: `${render_icon.circle_warning(icon_settings.circle_warning)} Số lái phụ vượt quá số chỗ ngồi`,
							type: 'warning'
						});
						return false;
					}
					
					input_4.value = parseFloat(input_5.value) - parseFloat(value);
					
					clearTimeout(typing_timer);
					typing_timer = setTimeout(() => {
						fee_charge.carCompulsory.numberOfPeopleInsured = parseInt(e.target.value);
						update_package.insurancePackageInfo.numberOfPeopleInsured = parseInt(e.target.value);
						insurance_package_info.numberOfPeopleInsured = parseInt(e.target.value);
						
						fee_charge.carCompulsory.so_nguoi_ngoi_tren_xe = parseInt(input_4.value);
						update_package.insurancePackageInfo.so_nguoi_ngoi_tren_xe = parseInt(input_4.value);
						insurance_package_info.so_nguoi_ngoi_tren_xe = parseInt(input_4.value);
						
					}, 100);
				});
				
				input_2.addEventListener('change', (e) => {
					clearTimeout(typing_timer);
					typing_timer = setTimeout(async () => {
						insurance_package_info.priceInsurance = e.target.value;
						fee_charge.carCompulsory.priceInsurance = e.target.value;
						update_package.insurancePackageInfo.priceInsurance = e.target.value;
						
						await fee_calculator();
					}, 100);
				});
				
				input_3.addEventListener('change', (e) => {
					clearTimeout(typing_timer);
					typing_timer = setTimeout(async () => {
						insurance_package_info.priceInsuranceSeatOnCar = e.target.value;
						fee_charge.carCompulsory.priceInsuranceSeatOnCar = e.target.value;
						update_package.insurancePackageInfo.priceInsuranceSeatOnCar = e.target.value;
						
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
				update_package['insurancePackageInfo']['priceInsuranceSeatOnCar'] = '';
				
				fee_charge['carCompulsory']['priceInsurance'] = '';
				update_package['insurancePackageInfo']['priceInsurance'] = '';
				
				fee_charge['carCompulsory']['so_nguoi_ngoi_tren_xe'] = '';
				update_package['insurancePackageInfo']['so_nguoi_ngoi_tren_xe'] = '';
				
				fee_charge['carCompulsory']['numberOfPeopleInsured'] = 0;
				update_package['insurancePackageInfo']['numberOfPeopleInsured'] = 0;
				
				await fee_calculator();
			}
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
				fee_charge.carCompulsory.seatNumber = parseInt(value);
				update_package.insurancePackageInfo.seatNumber = parseInt(value);
				
				await fee_calculator();
			}, 100);
		});
		
		return div;
	}
	
	async function step_2(params) {
		let {insurance_package_info, buyer_info, beneficiary} = params;
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
		template.appendChild(await order_info(data));
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
	
	template.appendChild(await order_info(data));
	template.appendChild(await step_1(insurance_package_info));
	template.appendChild(await step_2({
		insurance_package_info: insurance_package_info,
		buyer_info: buyer_info,
		beneficiary: beneficiary
	}));
	template.appendChild(await page_footer(data));
	
	return template;
}