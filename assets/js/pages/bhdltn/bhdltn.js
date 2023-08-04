import {
	create_element,
	render_icon,
	toast,
	preview_image,
	get_current_date,
	format_date,
	get_local_storage,
	set_local_storage,
	remove_local_storage,
	bhdt_api,
	api_end_point,
	fetch_data,
	fetch_form_data,
	format_price,
	input_required_check,
	loader,
	remove_loader,
	url_callback,
	login_as_guest,
	number_only,
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
	trash: {
		width: 14,
		height: 16,
		fill: '#000',
		stroke_width: 1.5
	},
	plus: {
		width: 16,
		height: 16,
		fill: '#2D63AF',
		stroke_width: 1.5
	},
	file_upload: {
		width: 12,
		height: 16,
		fill: '#000',
		stroke_width: 1.5
	},
	file_download: {
		width: 12,
		height: 16,
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

let tour_package = [
	{
		name: '10 triệu',
		value: '1'
	},
	{
		name: '20 triệu',
		value: '2'
	},
	{
		name: '30 triệu',
		value: '3'
	},
	{
		name: '40 triệu',
		value: '4'
	},
	{
		name: '50 triệu',
		value: '5'
	}
];

let tourist_list = {
	0 : {
		ds_ten: '',
		ds_cmt: '',
		ds_ng_sinh: '',
		ds_mobi: '',
		ds_gioi: '',
		ds_email: ''
	}
};

let nguoi_ds = [];

let gender_list = [
	{
		value: 1,
		name: 'Nam'
	},
	{
		value: 2,
		name: 'Nữ'
	}
];

let	typing_timer = null,
		user_local_storage = '';

if (localStorage.getItem('user')) {
	user_local_storage = await get_local_storage({name: 'user'});
}

if (localStorage.getItem('guest')) {
	user_local_storage = await get_local_storage({name: 'guest'});
}

let tour_payment = {
	providerCode: 'MIC',
	typeInsurance: '',
	buyer: {
		fullName: '',
		phone: '',
		email: '',
		address: '',
		ng_sinh: '',
		citizenCode: ''
	},
	beneficiary: {
		fullName: '',
		address: '',
		description: '',
		phone: '',
		email: '',
		provinceCode: '01'
	},
	totalAmount: 0,
	insurancePackageInfo: {
		nguoi_ds: [],
		gcn_dl_ttin_hd: {
			kieu_hd: 'G',
			so_hd_g: '',
			so_dt: '',
			ngay_hl: format_date(get_current_date()),
			ngay_kt: format_date(get_current_date()),
			vung: 'D',
			htrinh: 'Hành trình trong nước',
			ng_huong: '',
			ctrinh: '',
			ma_sp: 'NG_DLTN',
			ma_nt: 'VND'
		},
		gcn_dl_ttin_kh: {
			lkh: 'C',
			ten: '',
			cmt: '',
			mobi: '',
			email: '',
			ng_sinh: '',
			dchi: ''
		}
	}
}

let tour_charge = {
	action: 'Get_Dulich_MIC',
	providerCode: 'MIC',
	typeInsurance: '',
	baoHiemDuLich: {
		nguoi_ds: [],
		gcn_dl_ttin_hd: {
			kieu_hd: 'G',
			so_hd_g: '',
			so_dt: '',
			ngay_hl: format_date(get_current_date()),
			ngay_kt: format_date(get_current_date()),
			vung: 'D',
			htrinh: 'Hành trình trong nước',
			ng_huong: '',
			ctrinh: '',
			ma_sp: 'NG_DLTN',
			ma_nt: 'VND'
		},
		gcn_dl_ttin_kh: {
			lkh: 'C',
			ten: '',
			cmt: '',
			mobi: '',
			email: '',
			ng_sinh: '',
			dchi: ''
		}
	}
}

export const render = async (params) => {
	let {typeInsurance} = params;
	tour_charge['typeInsurance'] = typeInsurance;
	tour_payment['typeInsurance'] = typeInsurance;
	
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
				<p>Thông tin <br><span>Phạm vi bảo hiểm</span></p>
			</div>
			<div data-id="#step_2" class="item">
				<span class="number">2</span>
				<p>Thông tin <br><span>Thanh toán</span></p>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function done_typing_tourist_value(params) {
		let {id, name, obj, value} = params;
		obj[id][name] = value;
		nguoi_ds.length = 0;
		for (let [k,v] of Object.entries(obj)) {
			nguoi_ds.push(v);
		}
		
		tour_charge['baoHiemDuLich']['nguoi_ds'] = nguoi_ds;
		tour_payment['insurancePackageInfo']['nguoi_ds'] = nguoi_ds;
		tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']['so_dt'] = nguoi_ds.length;
	}
	
	async function render_tourist(params) {
		if (!params) return false;
		let tbody = template.querySelector('.table tbody');
		tbody.innerHTML = '';
		
		for (let [key, tourist] of Object.entries(params)) {
			// let {name, dob, phone_number, personal_id, gender} = tourist;
			let {ds_ten, ds_ng_sinh, ds_mobi, ds_cmt, ds_gioi} = tourist;
			
			let dob_d = ds_ng_sinh.split('/')[0],
					dob_m = ds_ng_sinh.split('/')[1],
					dob_y = ds_ng_sinh.split('/')[2],
					current_dob_d = '',
					current_dob_m = '',
					current_dob_y = '';
			
			let tr = create_element('tr');
			tr.innerHTML = `
			<td><input type="checkbox" ${tourist.checked ? 'checked' : ''}></td>
			<td class="text-center">${parseInt(key) + 1}</td>
				<td>
					<input class="input" type="text" placeholder="Họ & tên" name="tourist_name" value="${ds_ten || ''}" required>
				</td>
				<td>
					<input class="input" type="text" placeholder="Số CMT/CCCD" name="personal_id" value="${ds_cmt || ''}" required>
				</td>
				<td>
					<div class="grid grid-3 gap-8">
						<input class="input" type="text" placeholder="dd" name="tourist_dob_d" value="${dob_d || ''}" required>
						<input class="input" type="text" placeholder="mm" name="tourist_dob_m" value="${dob_m || ''}" required>
						<input class="input" type="text" placeholder="yyyy" name="tourist_dob_y" value="${dob_y || ''}" required>
					</div>
				</td>
				<td>
					<input class="input" type="text" placeholder="SĐT" name="tourist_phone" value="${ds_mobi || ''}">
				</td>
				<td>
					<select class="select" name="tourist_gender">
						<option value="" selected>Chọn</option>
						${
						gender_list.map(item => `<option value="${item.value}" ${ds_gioi == item.value ? 'selected' : ''}>${item.name}</option>`)
						}
					</select>
				</td>
				<td>
					<button type="button" class="btn btn-secondary btn-icon">
						${render_icon.trash(icon_settings.trash)}
						<span class="ml-6">Xóa</span>
					</button>
				</td>
			`;
			tr.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
				for (let [k, v] of Object.entries(params)) {
					delete v['checked']
				}
				if (e.target.checked == false) {
					delete params[key]['checked'];
					return false;
				}
				params[key]['checked'] = true;
				tbody.querySelectorAll('input[type="checkbox"]').forEach(input => {
					if (input !== e.target) input.checked = false;
				});
			});
			
			tr.querySelector('button').addEventListener('click', async () => {
				await delete_tourist(key);
			});
			
			tr.querySelector('[name="tourist_name"]').addEventListener('input', async (e) => {
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					done_typing_tourist_value({
						id: key, 
						name: 'ds_ten', 
						value: e.target.value, 
						obj: tourist_list
					});
				}, 200);
			});
			
			tr.querySelector('[name="personal_id"]').addEventListener('input', async (e) => {
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					done_typing_tourist_value({
						id: key, 
						name: 'ds_cmt', 
						value: e.target.value, 
						obj: tourist_list
					});
				}, 200);
			});
			
			tr.querySelector('[name="tourist_phone"]').addEventListener('input', async (e) => {
				await number_only(e);
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					done_typing_tourist_value({
						id: key, 
						name: 'ds_mobi', 
						value: e.target.value, 
						obj: tourist_list
					});
				}, 200);
			});
			
			tr.querySelector('[name="tourist_gender"]').addEventListener('change', async (e) => {
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					done_typing_tourist_value({
						id: key, 
						name: 'ds_gioi', 
						value: e.target.value, 
						obj: tourist_list
					});
				}, 100);
			});
			
			tr.querySelector('[name="tourist_dob_d"]').addEventListener('input', async (e) => {
				await number_only(e);
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					current_dob_d = e.target.value;
					if (parseFloat(current_dob_d) < 10 && current_dob_d.length < 2) {
						current_dob_d = '0' + current_dob_d;
					}
					
					done_typing_tourist_value({
						id: key, 
						name: 'ds_ng_sinh', 
						value: current_dob_d + '/' + current_dob_m + '/' + current_dob_y, 
						obj: tourist_list
					});
				}, 200);
			});
			
			tr.querySelector('[name="tourist_dob_m"]').addEventListener('input', async (e) => {
				await number_only(e);
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					current_dob_m = e.target.value;
					if (parseFloat(current_dob_m) < 10 && current_dob_m.length < 2) {
						current_dob_m = '0' + current_dob_m;
					}
						
					done_typing_tourist_value({
						id: key, 
						name: 'ds_ng_sinh', 
						value: current_dob_d + '/' + current_dob_m + '/' + current_dob_y, 
						obj: tourist_list
					});
				}, 200);
			});
			
			tr.querySelector('[name="tourist_dob_y"]').addEventListener('input', async (e) => {
				await number_only(e);
				clearTimeout(typing_timer);
				typing_timer = setTimeout(() => {
					current_dob_y = e.target.value;
					done_typing_tourist_value({
						id: key, 
						name: 'ds_ng_sinh', 
						value: current_dob_d + '/' + current_dob_m + '/' + current_dob_y, 
						obj: tourist_list
					});
				}, 200);
			});
			
			tbody.appendChild(tr);
		}
	}
	
	async function add_tourist() {
		let new_tourist = {
			ds_ten: '',
			ds_cmt: '',
			ds_ng_sinh: '',
			ds_mobi: '',
			ds_gioi: '',
			ds_email: ''
		}
		
		let key = Object.keys(tourist_list).length;
		tourist_list[key] = new_tourist;
		render_tourist(tourist_list);
		await fee_calculator();
	}
	
	async function delete_tourist(id) {
		delete tourist_list[id];
		let clone = {},
				keys = [],
				old_value = [];
				
		function rename_key() {			
			for (let i in Object.keys(tourist_list)) {
				keys.push(i);
			}
			
			for (let [k, v] of Object.entries(tourist_list)) {
				old_value.push(v);
			}
			
			for (let key of keys) {
				clone[key] = old_value[key];
			}
			
			tourist_list = {...clone};
		}
		await rename_key();
		await render_tourist(tourist_list);
		await fee_calculator();
	}
	
	async function fee_calculator(params) {
		if (!Object.keys(tourist_list).length) {
			toast({
				message: `${render_icon.circle_warning(icon_settings.circle_warning)} Danh sách người tham gia bảo hiểm đang trống`,
				type: 'warning'
			});
			return false;
		}
		
		tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd']['so_dt'] = Object.keys(tourist_list).length;
		
		let fee_calculator_request = {
			method: 'POST',
			url: bhdt_api + api_end_point.contract + '/tinh-phi',
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			body: tour_charge,
			async callback(data) {
				template.querySelectorAll('.total-fee').forEach(item => {
					item.innerHTML = format_price(parseInt(data.data.phi)) + ' VND';
				});
				
				tour_payment.totalAmount = data.data.phi;
				await remove_loader();
			}
		}
		loader();
		await fetch_data(fee_calculator_request);
	}
	
	async function done_typing_contract_value(params) {
		let {name, obj, name_2, obj_2, name_3, obj_3, value} = params;
		if (name && obj) obj[name] = value;
		if (name_2 && obj_2) obj_2[name_2] = value;
		if (name_3 && obj_3) obj_3[name_3] = value;
	}
	
	let get_sample_file_request = {
		method: 'GET',
		url: bhdt_api + api_end_point.contract + '/file-mau',
		auth: user_local_storage.user,
		api_key: user_local_storage.api_key,
		async callback(params) {
			let a = create_element('a');
			a.setAttribute('href', `${bhdt_api.replace('api/', '')}${params.data.fileName}`);
			a.setAttribute('target', '_blank');
			a.click();
		}
	}
	
	let get_data_from_excel_file = {
		method: 'POST',
		url: bhdt_api + api_end_point.contract + '/upload-danh-sach-nguoi-from-excel',
		auth: user_local_storage.user,
		api_key: user_local_storage.api_key,
		async callback(params) {
			await remove_loader();
			await load_tourist_list_form_excel(params);
		}
	}
	
	async function load_tourist_list_form_excel(params) {
		Object.keys(tourist_list).length = 0;
		params.datas.map((tourist, index) => {
			let gender = tourist['ds_gioi'];
			if (gender.toLowerCase() == 'nam') tourist['ds_gioi'] = 1;
			if (gender.toLowerCase() == 'nu') tourist['ds_gioi'] = 2;
			
			tourist_list[index] = tourist;
		});
		
		await render_tourist(tourist_list);
	}
	
	async function step_1(params) {
		let {totalAmount, insurancePackageInfo} = params;
		let {gcn_dl_ttin_hd, gcn_dl_ttin_kh} = insurancePackageInfo;
		
		let state_sd_d = gcn_dl_ttin_hd['ngay_hl'].split('/')[0],
				state_sd_m = gcn_dl_ttin_hd['ngay_hl'].split('/')[1],
				state_sd_y = gcn_dl_ttin_hd['ngay_hl'].split('/')[2],
				state_start_date = state_sd_y + '-' + state_sd_m + '-' + state_sd_d;
		
		let state_ed_d = gcn_dl_ttin_hd['ngay_kt'].split('/')[0],
				state_ed_m = gcn_dl_ttin_hd['ngay_kt'].split('/')[1],
				state_ed_y = gcn_dl_ttin_hd['ngay_kt'].split('/')[2],
				state_end_date = state_ed_y + '-' + state_ed_m + '-' + state_ed_d;
		
		let div = create_element('div');
		div.setAttribute('id', 'step_1');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<div class="row">
			<div class="col-md-4 mb-14">
				<span class="label required">Kiểu hợp đồng</span>
				<select class="select" name="contract_type" required>
					<option value="G" selected>Gốc</option>
					<option value="B">Bổ sung</option>
					<option value="T">Tái tục</option>
				</select>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Ngày mua</span>
				<div class="row">
					<div class="col-4 col-md-4">
						<input type="tel" class="input" name="state_sd_d" value="${state_sd_d}" placeholder="dd" required>
					</div>
					<div class="col-4 col-md-4">
						<input type="tel" class="input" name="state_sd_m" value="${state_sd_m}" placeholder="mm" required>
					</div>
					<div class="col-4 col-md-4">
						<input type="tel" class="input" name="state_sd_y" value="${state_sd_y}" placeholder="yyyy" required>
					</div>
				</div>
			</div>
			<div class="col-md-4 mb-14">
				<span class="label required">Hạn kết thúc</span>
				<div class="row">
					<div class="col-4 col-md-4">
						<input type="tel" class="input" name="state_ed_d" value="${state_ed_d}" placeholder="dd" required>
					</div>
					<div class="col-4 col-md-4">
						<input type="tel" class="input" name="state_ed_m" value="${state_ed_m}" placeholder="mm" required>
					</div>
					<div class="col-4 col-md-4">
						<input type="tel" class="input" name="state_ed_y" value="${state_ed_y}" placeholder="yyyy" required>
					</div>
				</div>
			</div>

			<div class="col-md-4 mb-14">
				<span class="label">Hành trình</span>
				<input type="text" class="input" name="trip" value="${gcn_dl_ttin_hd.htrinh}">
			</div>
			<div class="col-md-4 row m-0 p-0">
				<div class="col-6 col-md-6 mb-14">
					<span class="label required">Đơn vị tiền</span>
					<select class="select" name="money_unit" required>
						<option value="VND" selected>VND</option>
					</select>
				</div>
				<div class="col-6 col-md-6 mb-14">
					<span class="label required">Gói chương trình</span>
					<select class="select" name="package" required>
						<option value="" selected>Chọn</option>
						${
						tour_package.map(item => {
							return `<option value="${item.value}" ${item.value == gcn_dl_ttin_hd['ctrinh'] ? 'selected' : ''}>${item.name}</option>`
						})
						}
					</select>
				</div>
			</div>
		</div>
		
		<h4 class="mb-12">Danh sách người tham gia bảo hiểm (Trẻ em chưa có CMT nhập gạch chéo (/) và thêm số thứ tự)</h4>
		<div class="overflow-hidden mb-14">
			<div class="scrollable-table mb-14">
				<table class="table">
					<thead>
						<tr>
							<th width="2%"></th>
							<th width="3%">#</th>
							<th width="20%"><span class="required">Họ & tên</span></th>
							<th width="20%"><span class="required">Số CMT/CCCD</span></th>
							<th width="20%"><span class="required">Ngày sinh</span></th>
							<th width="10%">SĐT</th>
							<th width="10%">Giới tính</th>
							<th width="5%"></th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
			
			<div class="grid grid-md-2 gap-14 align-items-center">
				<button type="button" class="btn btn-dashed-outline-primary btn-icon" id="add_tourist">
					${render_icon.plus(icon_settings.plus)}<span class="ml-6">Thêm người vào danh sách</span>
				</button>
				<div class="d-flex align-items-center">
					<button class="btn btn-icon btn-secondary btn-upload mr-8">
						${render_icon.file_upload(icon_settings.file_upload)}<span class="ml-6">Tải lên file excel</span>
						<input type="file" name="upload_excel">
					</button>
					<button class="btn btn-icon btn-secondary mr-8 get-sample">
						${render_icon.file_download(icon_settings.file_download)}<span class="ml-6">Tải về file mẫu</span>
					</button>
				</div>
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
		//
		// update contact
		//
		div.querySelector('[name="contract_type"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'kieu_hd', 
					name_2: 'kieu_hd', 
					value: e.target.value, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
			}, 100);
		});
		//
		// start date
		//
		div.querySelector('[name="state_sd_d"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				state_sd_d = e.target.value;
				if (parseFloat(state_sd_d) < 10 && state_sd_d.length < 2) {
					state_sd_d = '0' + state_sd_d;
				}

				done_typing_contract_value({
					name: 'ngay_hl', 
					name_2: 'ngay_hl', 
					value: state_sd_d + '/' + state_sd_m + '/' + state_sd_y, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 400);
		});

		div.querySelector('[name="state_sd_m"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				state_sd_m = e.target.value;
				if (parseFloat(state_sd_m) < 10 && state_sd_m.length < 2) {
					state_sd_m = '0' + state_sd_m;
				}

				done_typing_contract_value({
					name: 'ngay_hl', 
					name_2: 'ngay_hl', 
					value: state_sd_d + '/' + state_sd_m + '/' + state_sd_y, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 400);
		});

		div.querySelector('[name="state_sd_y"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				state_sd_y = e.target.value;
				if (state_sd_y.length < 4) return false;
				
				done_typing_contract_value({
					name: 'ngay_hl', 
					name_2: 'ngay_hl', 
					value: state_sd_d + '/' + state_sd_m + '/' + state_sd_y, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 400);
		});
		//
		// end date
		//
		div.querySelector('[name="state_ed_d"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				state_ed_d = e.target.value;
				if (parseFloat(state_ed_d) < 10 && state_ed_d.length < 2) {
					state_ed_d = '0' + state_ed_d;
				}

				done_typing_contract_value({
					name: 'ngay_kt', 
					name_2: 'ngay_kt', 
					value: state_ed_d + '/' + state_ed_m + '/' + state_ed_y, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 400);
		});

		div.querySelector('[name="state_ed_m"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				state_ed_m = e.target.value;
				if (parseFloat(state_ed_m) < 10 && state_ed_m.length < 2) {
					state_ed_m = '0' + state_ed_m;
				}

				done_typing_contract_value({
					name: 'ngay_kt', 
					name_2: 'ngay_kt', 
					value: state_ed_d + '/' + state_ed_m + '/' + state_ed_y, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 400);
		});

		div.querySelector('[name="state_ed_y"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				state_ed_y = e.target.value;
				if (state_ed_y.length != 4) return false;
				
				done_typing_contract_value({
					name: 'ngay_kt', 
					name_2: 'ngay_kt', 
					value: state_ed_d + '/' + state_ed_m + '/' + state_ed_y, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 400);
		});
		
		div.querySelector('[name="package"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				done_typing_contract_value({
					name: 'ctrinh', 
					name_2: 'ctrinh', 
					value: e.target.value, 
					obj: tour_charge['baoHiemDuLich']['gcn_dl_ttin_hd'],
					obj_2: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
				
				await fee_calculator();
			}, 100);
		});
		//
		// change step
		//
		let next_step = div.querySelector('.btn-primary'),
				fee_btn = div.querySelector('.btn-cyan')
		next_step.addEventListener('click', async () => {
			if (!user_local_storage) return false;
			
			if (!tour_payment.totalAmount) {
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
			let beneficiary = {}
			for (let [k, v] of Object.entries(tourist_list)) {
				if (v['checked']) {
					beneficiary = {...v}
					tour_payment.beneficiary.fullName = v.ds_ten;
					tour_payment.beneficiary.phone = v.ds_mobi;
					
					tour_payment.buyer.fullName = v.ds_ten;
					tour_payment.buyer.phone = v.ds_mobi;
					
					tour_payment.insurancePackageInfo.gcn_dl_ttin_hd.ng_huong = v.ds_ten;
					tour_payment.insurancePackageInfo.gcn_dl_ttin_kh.ten = v.ds_ten;
					tour_payment.insurancePackageInfo.gcn_dl_ttin_kh.cmt = v.ds_cmt;
					tour_payment.insurancePackageInfo.gcn_dl_ttin_kh.mobi = v.ds_mobi;
					tour_payment.insurancePackageInfo.gcn_dl_ttin_kh.ng_sinh = v.ds_ng_sinh;
				}
			}
			await change_step(
				{
					current: '#step_1', 
					next: '#step_2', 
					async move() {
						template.appendChild(await step_2(tour_payment, beneficiary));
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
		
		div.querySelector('#add_tourist').addEventListener('click', async () => {
			await add_tourist();
		});
		
		div.querySelector('.get-sample').addEventListener('click', async() => {
			await fetch_data(get_sample_file_request);
		});
		
		div.querySelector('[name="upload_excel"]').addEventListener('change', async (e) => {
			if (!/.*\.(xlsx|xls)/g.test(e.target.files[0].name)) {
        toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} File không đúng định dạng`,
					type: 'warning'
				});
        return false;
      }
			let form_data = new FormData();
     	form_data.append('file', e.target.files[0]);
			get_data_from_excel_file.body = form_data;
			await loader();
			await fetch_form_data(get_data_from_excel_file);
			e.target.value = '';
		});
		
		return div;
	}
	
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
			body: tour_payment,
			auth: user_local_storage.user,
			api_key: user_local_storage.api_key,
			async callback(params) {
				await remove_loader();
				await set_local_storage({
					name: 'payment',
					value: {
						data: tour_payment,
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
	
	async function step_2(params, beneficiary) {
		let {totalAmount, insurancePackageInfo} = params;
		let {gcn_dl_ttin_hd, gcn_dl_ttin_kh} = insurancePackageInfo;
		
		let current_dob_d = '',
				current_dob_m = '',
				current_dob_y = '';
		
		if (Object.keys(beneficiary).length) {
			current_dob_d = beneficiary['ds_ng_sinh'].split('/')[0];
			current_dob_m = beneficiary['ds_ng_sinh'].split('/')[1];
			current_dob_y = beneficiary['ds_ng_sinh'].split('/')[2];
		}
		
		if (gcn_dl_ttin_kh['ng_sinh'].length) {
			current_dob_d = gcn_dl_ttin_kh['ng_sinh'].split('/')[0];
			current_dob_m = gcn_dl_ttin_kh['ng_sinh'].split('/')[1];
			current_dob_y = gcn_dl_ttin_kh['ng_sinh'].split('/')[2];
		}
		
		let div = create_element('div');
		div.setAttribute('id', 'step_2');
		div.classList.add('tab-pane', 'show');
		div.innerHTML = `
		<!--
		<label for="use_paper_1" class="mb-14 note cursor-pointer d-flex align-items-center">
			<input id="use_paper_1" type="checkbox" class="mr-6">
			<b>Dùng ảnh CMT/CCCD để nhập nhanh thông tin</b>
		</label>

		<div class="d-flex image-row" style="display: none;">
			<div class="mr-14 mb-14">
				<span class="label required">Ảnh mặt trước</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="front_image">
				</div>
			</div>
			<div class="mb-14">
				<span class="label required">Ảnh mặt sau</span>
				<div class="image ratio-16-9 rounded-8 image-upload">
					<input type="file" name="back_image">
				</div>
			</div>
		</div>
		-->
		<div class="d-flex align-items-center mb-14">
			<label for="customer_type_1" class="label cursor-pointer d-flex align-items-center mr-14">
				<input id="customer_type_1" class="mr-6" type="radio" name="customer_type" required value="C" ${gcn_dl_ttin_kh['lkh'] == 'C' ? 'checked' : ''}>
				<span>Cá nhân</span>
			</label>
			<label for="customer_type_2" class="label cursor-pointer d-flex align-items-center">
				<input id="customer_type_2" class="mr-6" type="radio" name="customer_type" required value="T" ${gcn_dl_ttin_kh['lkh'] == 'T' ? 'checked' : ''}>
				<span>Tổ chức</span>
			</label>
		</div>

		<div class="row">
			<div class="col-md-3 mb-14">
				<span class="label required">Tên người mua</span>
				<input type="text" class="input" name="buyer_full_name" placeholder="Họ & tên" required value="${beneficiary['ds_ten'] || gcn_dl_ttin_hd['ng_huong']}">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">SĐT</span>
				<input type="tel" class="input phone-check" name="buyer_phone_number" placeholder="SĐT" required value="${beneficiary['ds_mobi'] || gcn_dl_ttin_kh['mobi']}">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label">Email</span>
				<input type="tel" class="input" name="buyer_email" placeholder="Email" value="${gcn_dl_ttin_kh['email']}">
			</div>
			<div class="col-md-3 mb-14">
				<span class="label required">Số CMT/CCCD</span>
				<input type="text" class="input" name="buyer_id" placeholder="Số CMT/CCCD" required value="${beneficiary['ds_cmt'] || gcn_dl_ttin_kh['cmt']}">
			</div>
			<div class="col-md-6 mb-14">
				<span class="label required">Địa chỉ</span>
				<input type="text" class="input" name="buyer_address" placeholder="Địa chỉ" required value="${gcn_dl_ttin_kh['dchi']}">
			</div>
			
			<div class="col-md-3 mb-14">
				<span class="label required">
					Ngày sinh <small class="text-secondary"><em class="font-weight-normal">(Người mua phải trên 18 tuổi)</em></small>
				</span>
				<div class="grid grid-3 gap-8 mb-14">
					<input class="input" type="tel" placeholder="Ngày" name="buyer_date" required value="${current_dob_d}">
					<input class="input" type="tel" placeholder="Tháng" name="buyer_month" required value="${current_dob_m}">
					<input class="input" type="tel" placeholder="Năm" name="buyer_year" required value="${current_dob_y}">
				</div>
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
		//
		// update buyer
		//
		div.querySelectorAll('[name="customer_type"]').forEach(input => {
			input.addEventListener('change', (e) => {
				if (e.target.checked == true) {
					tour_charge['baoHiemDuLich']['gcn_dl_ttin_kh']['lkh'] = e.target.value;
					tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh']['lkh'] = e.target.value;
				}
			});
		});
		
		div.querySelector('[name="buyer_full_name"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'ten', 
					name_2: 'fullName', 
					name_3: 'fullName', 
					value: e.target.value, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer'],
					obj_3: tour_payment['beneficiary']
				});
				
				done_typing_contract_value({
					name: 'ng_huong',
					value: e.target.value, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_hd']
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_phone_number"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'mobi', 
					name_2: 'phone', 
					name_3: 'phone', 
					value: e.target.value, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer'],
					obj_3: tour_payment['beneficiary'],
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_email"]').addEventListener('input', async (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'email', 
					name_2: 'email', 
					name_3: 'email', 
					value: e.target.value, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer'],
					obj_3: tour_payment['beneficiary'],
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_id"]').addEventListener('input', async (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'cmt', 
					name_2: 'citizenCode',
					value: e.target.value, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer']
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_address"]').addEventListener('input', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				done_typing_contract_value({
					name: 'dchi', 
					name_2: 'address', 
					value: e.target.value, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer']
				});
			}, 100);
		});
		
		div.querySelector('[name="buyer_date"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				current_dob_d = e.target.value;
				if (parseFloat(current_dob_d) < 10 && current_dob_d.length < 2) {
					current_dob_d = '0' + current_dob_d;
				}

				done_typing_contract_value({
					name: 'ng_sinh', 
					name_2: 'ng_sinh', 
					value: current_dob_d + '/' + current_dob_m + '/' + current_dob_y, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer']
				});
			}, 200);
		});
			
		div.querySelector('[name="buyer_month"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				current_dob_m = e.target.value;
				if (parseFloat(current_dob_m) < 10 && current_dob_m.length < 2) {
					current_dob_m = '0' + current_dob_m;
				}

				done_typing_contract_value({
					name: 'ng_sinh', 
					name_2: 'ng_sinh', 
					value: current_dob_d + '/' + current_dob_m + '/' + current_dob_y, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer']
				});
			}, 200);
		});

		div.querySelector('[name="buyer_year"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				current_dob_y = e.target.value;
				done_typing_contract_value({
					name: 'ng_sinh', 
					name_2: 'ng_sinh', 
					value: current_dob_d + '/' + current_dob_m + '/' + current_dob_y, 
					obj: tour_payment['insurancePackageInfo']['gcn_dl_ttin_kh'],
					obj_2: tour_payment['buyer']
				});
			}, 200);
		});
		//
		// change step
		//
		let previous_step = div.querySelector('.btn-secondary'),
				completed_btn = div.querySelector('.btn-primary');
		
		previous_step.addEventListener('click', async () => {
			await change_step(
				{
					current: '#step_2', 
					next: '#step_1', 
					async move() {
						template.appendChild(await step_1(tour_payment));
						await render_tourist(tourist_list);
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
		//
		// other action
		//
		/*
		await checkbox_toggle(div.querySelector('input[type="checkbox"]'), div.querySelector('.image-row'), 'flex');
		
		await preview_image({
			preview: div.querySelector('input[name="front_image"]').parentElement,
			input: div.querySelector('input[name="front_image"]')
		});
		
		await preview_image({
			preview: div.querySelector('input[name="back_image"]').parentElement,
			input: div.querySelector('input[name="back_image"]')
		});
		*/
		
		return div;
	}
	
	template.appendChild(await process_section());
	template.appendChild(await step_1(tour_payment));
	await render_tourist(tourist_list);
	
	return template;
}