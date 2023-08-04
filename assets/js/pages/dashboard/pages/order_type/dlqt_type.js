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
	},
	circle_warning: {
		width: 14,
		height: 14,
		fill: '#f93154',
		stroke_width: 1.5
	}
}

let fee_charge = {
	action: 'Get_Dulich_MIC',
	providerCode: 'MIC',
	typeInsurance: '',
	baoHiemDuLich: {
		nguoi_ds: [],
		gcn_dl_ttin_hd: {
			kieu_hd: 'G',
			so_hd_g: '',
			so_dt: '',
			ngay_hl: '',
			ngay_kt: '',
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

let tourist_list = {};
let nguoi_ds = [];

let tour_package = [
	{
		name: '10.000',
		value: 1
	},
	{
		name: '30.000',
		value: 2
	},
	{
		name: '50.000',
		value: 3
	},
	{
		name: '70.000',
		value: 4
	}
];

let region = {
	D: {
		name: 'Đông Nam Á',
		trip: 'Việt Nam - Đông Nam Á - Việt Nam'
	},
	A: {
		name: 'Châu Á',
		trip: 'Việt Nam - Châu Á - Việt Nam'
	},
	T: {
		name: 'Toàn cầu',
		trip: 'Việt Nam - Toàn cầu - Việt Nam'
	}
}

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

let update_package = {
	buyer: {},
	beneficiary: {},
	insurancePackageInfo: {}
};

let	typing_timer = null;
let current_order = {};

export async function render(params) {
	current_order = {...params}
	let {data, user_local_storage} = current_order;
	let {beneficiary} = data;
	let insurance_package_info = JSON.parse(data.insurancePackageInfo);
	let buyer_info = JSON.parse(data.buyerInfo);
	insurance_package_info['nguoi_ds'].map((item, index) => {
		tourist_list[index] = item;
	});
	
	update_package.buyer = {...buyer_info};
	update_package.beneficiary = {...beneficiary};
	update_package.insurancePackageInfo = {...insurance_package_info};
	update_package.totalAmount = data.totalAmount;
	
	let template = create_element('div');
	template.classList.add('grid', 'gap-28');
	
	async function fee_calculator(params) {
		if (!Object.keys(tourist_list).length) {
			toast({
				message: `${render_icon.circle_warning(icon_settings.circle_warning)} Danh sách người tham gia bảo hiểm đang trống`,
				type: 'warning'
			});
			return false;
		}
		
		fee_charge.baoHiemDuLich.gcn_dl_ttin_hd.ngay_hl = insurance_package_info.ngay_hl;
		fee_charge.baoHiemDuLich.gcn_dl_ttin_hd.ngay_kt = insurance_package_info.ngay_kt;
		
		fee_charge.baoHiemDuLich.nguoi_ds = nguoi_ds;
		fee_charge.gcn_dl_ttin_hd = update_package.insurancePackageInfo;
		fee_charge.baoHiemDuLich.gcn_dl_ttin_hd.so_dt = Object.keys(tourist_list).length;
		
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
	
	async function order_info(data) {
		let div = create_element('div');
		div.innerHTML = `
		<div class="mb-24" style="display: flex; align-items: center;">
			<span onclick="location.href = '/dashboard/sale-history'" class="btn back mr-18">
				${render_icon.chevron_left(icon_settings.chevron_left)}
			</span>
			<h4 style="font-size: 16px;">Du lịch toàn cầu</h4>
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
					<h4>${format_price(data.totalAmount)} VND</h4>
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
	
	async function step_1(insurance_package_info) {
		let {gcn_dl_ttin_hd, gcn_dl_ttin_kh} = insurance_package_info;
		
		let s_d = gcn_dl_ttin_hd.ngay_hl.split('/')[0],
				s_m = gcn_dl_ttin_hd.ngay_hl.split('/')[1],
				s_y = gcn_dl_ttin_hd.ngay_hl.split('/')[2],
				e_d = gcn_dl_ttin_hd.ngay_kt.split('/')[0],
				e_m = gcn_dl_ttin_hd.ngay_kt.split('/')[1],
				e_y = gcn_dl_ttin_hd.ngay_kt.split('/')[2];
				
		let div = create_element('div');
		div.innerHTML = `
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<span class="label requried">Người hưởng thụ</span>
					<input type="text" class="input" name="beneficiary_name" value="${gcn_dl_ttin_hd.ng_huong}" placeholder="Họ & tên" required>
				</div>
				<div>
					<span class="label requried">Kiểu hợp đồng</span>
					<select class="select" name="contract_type" required>
						<option value="G" ${gcn_dl_ttin_hd.kieu_hd == 'G' ? 'selected' : ''}>Gốc</option>
						<option value="B" ${gcn_dl_ttin_hd.kieu_hd == 'B' ? 'selected' : ''}>Bổ sung</option>
						<option value="T" ${gcn_dl_ttin_hd.kieu_hd == 'T' ? 'selected' : ''}>Tái tục</option>
					</select>
				</div>
				<div>
					<span class="label requried">Ngày mua</span>
					<input type="date" class="input" name="start_date" value="${s_y}-${s_m}-${s_d}" required>
				</div>
				<div>
					<span class="label requried">Ngày kết thúc</span>
					<input type="date" class="input" name="end_date" value="${e_y}-${e_m}-${e_d}" required>
				</div>
			</div>
		</div>
		
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14">
				<div>
					<span class="label requried">Vùng</span>
					<select class="select" name="region" required>
						
					</select>
				</div>
				<div>
					<span class="label">Hành trình</span>
					<input type="text" class="input" name="trip" value="${gcn_dl_ttin_hd.htrinh}" readonly>
				</div>
				<div>
					<span class="label requried">Gói chương trình</span>
					<select class="select" name="package" required>
						${
						tour_package.map(item => {
							return `<option value="${item.value}" ${item.value == gcn_dl_ttin_hd.ctrinh ? 'selected' : ''}>${item.name}</option>`
						}).join('')
						}
					</select>
				</div>
			</div>
		</div>
		`;
		
		for (let [k, v] of Object.entries(region)) {
			let option = create_element('option');
			option.value = k;
			option.innerHTML = v.name;
			if (gcn_dl_ttin_hd.vung == k) option.setAttribute('selected', 'selected');
			
			div.querySelector('[name="region"]').appendChild(option);
		}
		
		div.querySelector('[name="region"]').addEventListener('change', (e) => {
			update_package.insurancePackageInfo.gcn_dl_ttin_hd.vung = e.target.value;
			update_package.insurancePackageInfo.gcn_dl_ttin_hd.htrinh = region[e.target.value].name;
			div.querySelector('[name="trip"]').value = region[e.target.value].name;
		});
		
		div.querySelector('[name="beneficiary_name"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.beneficiary.fullName = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="contract_type"]').addEventListener('change', async (e) => {
			update_package.insurancePackageInfo.gcn_dl_ttin_hd.kieu_hd = e.target.value;
			await fee_calculator();
		});
		
		div.querySelector('[name="start_date"]').addEventListener('input', (e) => {
			let day = e.target.value.split('-')[2],
					month = e.target.value.split('-')[1],
					year = e.target.value.split('-')[0],
					value = day + '/' + month + '/' + year;
			
			let start_date = get_current_date();
			if ((Date.parse(e.target.value) <= Date.parse(start_date))) {
				e.target.value = start_date;
			}
			
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_hd.ngay_hl = e.target.value;
				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('[name="end_date"]').addEventListener('input', async (e) => {
			let day = e.target.value.split('-')[2],
					month = e.target.value.split('-')[1],
					year = e.target.value.split('-')[0],
					value = day + '/' + month + '/' + year;
			let start_date = div.querySelector('[name="start_date"]').value;
			if (parseInt(year) < new Date().getFullYear()) return false;
			if ((Date.parse(e.target.value) <= Date.parse(start_date))) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Ngày hết hạn không hợp lệ`,
					type: 'warning'
				});
				e.target.value = start_date;
				return false;
			}
			
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_hd.ngay_kt = e.target.value;
				await fee_calculator();
			}, 100);
		});
		
		div.querySelector('[name="package"]').addEventListener('change', async (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_hd.ctrinh = e.target.value;
				await fee_calculator();
			}, 100);
		});
		
		return div;
	}
	
	async function step_2(insurance_package_info) {
		let {gcn_dl_ttin_hd, gcn_dl_ttin_kh} = insurance_package_info;
		let b_d = gcn_dl_ttin_kh.ng_sinh.split('/')[0],
				b_m = gcn_dl_ttin_kh.ng_sinh.split('/')[1],
				b_y = gcn_dl_ttin_kh.ng_sinh.split('/')[2];
		
		let current_dob_d = '',
				current_dob_m = '',
				current_dob_y = '';
		
		let div = create_element('div');
		div.innerHTML = `
		<div class="card" style="margin-bottom: 8px;">
			<div class="grid grid-md-4 gap-14 mb-14">
				<div>
					<span class="label required">Loại khách hàng</span>
					<select class="select" name="customer_type" required>
						<option value="C" ${gcn_dl_ttin_kh.lkh == 'C' ? 'selected' : ''}>Cá nhân</option>
						<option value="T" ${gcn_dl_ttin_kh.lkh == 'T' ? 'selected' : ''}>Tổ chức</option>
					</select>
				</div>
				<div>
					<span class="label required">Người mua</span>
					<input type="text" class="input" name="buyer_name" placeholder="Họ & tên" value="${gcn_dl_ttin_kh.ten}" required>
				</div>
				<div>
					<span class="label required">SĐT</span>
					<input type="text" class="input" name="buyer_phone_number" placeholder="SĐT" value="${gcn_dl_ttin_kh.mobi}" required>
				</div>
				<div>
					<span class="label required">Email</span>
					<input type="text" class="input" name="buyer_email" placeholder="Email" value="${gcn_dl_ttin_kh.email}" required>
				</div>
			</div>
			<div class="grid grid-md-2 gap-14 mb-14">
				<div class="grid grid-md-2 gap-14">
					<div>
						<span class="label requried">Ngày sinh</span>
						<div class="row">
							<div class="col-md-4">
								<input type="tel" class="input" name="buyer_date" value="${b_d}" required>
							</div>
							<div class="col-md-4">
								<input type="tel" class="input" name="buyer_month" value="${b_m}" required>
							</div>
							<div class="col-md-4">
								<input type="tel" class="input" name="buyer_year" value="${b_y}" required>
							</div>
						</div>
					</div>
					<div>
						<span class="label required">CMT/CCCD</span>
						<input type="text" class="input" name="buyer_id" placeholder="CMT/CCCD" value="${gcn_dl_ttin_kh.cmt}" required>
					</div>
				</div>
				<div>
					<span class="label required">Địa chỉ</span>
					<input type="text" class="input" name="buyer_address" placeholder="Địa chỉ" value="${gcn_dl_ttin_kh.dchi}" required>
				</div>
			</div>
		</div>
		`;
		
		div.querySelector('[name="customer_type"]').addEventListener('change', (e) => {
			update_package.insurancePackageInfo.gcn_dl_ttin_kh.lkh = e.target.value;
		});
		
		div.querySelector('[name="buyer_name"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.ten = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="buyer_email"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.email = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="buyer_phone_number"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.mobi = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="buyer_id"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.cmt = e.target.value;
			}, 100);
		});
		
		div.querySelector('[name="buyer_address"]').addEventListener('change', (e) => {
			clearTimeout(typing_timer);
			typing_timer = setTimeout(async () => {
				update_package.gcn_dl_ttin_kh.address = e.target.value;
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
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.ng_sinh = current_dob_d + '/' + current_dob_m + '/' + current_dob_y;
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
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.ng_sinh = current_dob_d + '/' + current_dob_m + '/' + current_dob_y;
			}, 200);
		});

		div.querySelector('[name="buyer_year"]').addEventListener('input', async (e) => {
			await number_only(e);
			clearTimeout(typing_timer);
			typing_timer = setTimeout(() => {
				current_dob_y = e.target.value;
				update_package.insurancePackageInfo.gcn_dl_ttin_kh.ng_sinh = current_dob_d + '/' + current_dob_m + '/' + current_dob_y;
			}, 200);
		});
		
		return div;
	}
	
	async function done_typing_tourist_value(params) {
		let {id, name, obj, value} = params;
		obj[id][name] = value;
		nguoi_ds.length = 0;
		for (let [k,v] of Object.entries(obj)) {
			nguoi_ds.push(v);
		}
		
		update_package.insurancePackageInfo.nguoi_ds = nguoi_ds;
		update_package.insurancePackageInfo.gcn_dl_ttin_hd.so_dt = nguoi_ds.length;
	}
	
	async function render_tourist(params) {
		if (!params) return false;
		let tbody = template.querySelector('.table tbody');
		tbody.innerHTML = '';
		
		for (let [key, tourist] of Object.entries(tourist_list)) {
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
			<td class="text-center">${parseInt(key) + 1}</td>
				<td>
					<input class="input" type="text" placeholder="Họ & tên" name="tourist_name" value="${ds_ten || ''}" required>
				</td>
				<td>
					<input class="input" type="text" placeholder="Số CMT/CCCD" name="personal_id" value="${ds_cmt || ''}" required>
				</td>
				<td>
					<div class="grid grid-3 gap-8">
						<input class="input" type="tel" placeholder="Ngày" name="tourist_dob_d" value="${dob_d || ''}" required>
						<input class="input" type="tel" placeholder="Tháng" name="tourist_dob_m" value="${dob_m || ''}" required>
						<input class="input" type="tel" placeholder="Năm" name="tourist_dob_y" value="${dob_y || ''}" required>
					</div>
				</td>
				<td>
					<input class="input" type="tel" placeholder="SĐT" name="tourist_phone" value="${ds_mobi || ''}">
				</td>
				<td>
					<select class="select" name="tourist_gender">
						<option value="" selected>Chọn</option>
						${
						gender_list.map(item => `<option value="${item.value}" ${ds_gioi == item.value ? 'selected' : ''}>${item.name}</option>`)
						}
					</select>
				</td>
			`;
			
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
	
	async function tourist_list_dom() {
		let div = create_element('div');
		div.innerHTML = `
		<div class="card" style="margin-bottom: 8px;">
			<div class="overflow-hidden">
				<div class="scrollable-table">
					<table class="table">
						<thead>
							<tr>
								<th width="3%">#</th>
								<th width="20%"><span class="required">Họ & tên</span></th>
								<th width="20%"><span class="required">CMT/CCCD</span></th>
								<th width="20%"><span class="required">Ngày sinh</span></th>
								<th width="10%">SĐT</th>
								<th width="10%">Giới tính</th>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
				</div>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function handle_after_update(params) {
		current_order = {...params}
		let {data, user_local_storage} = current_order;
		let {beneficiary} = data;
		let insurance_package_info = JSON.parse(data.insurancePackageInfo);
		let buyer_info = JSON.parse(data.buyerInfo);
		insurance_package_info['nguoi_ds'].map((item, index) => {
			tourist_list[index] = item;
		});
		
		update_package.totalAmount = data.totalAmount;
		
		template.innerHTML = ``;
		template.appendChild(await order_info(data));
		template.appendChild(await step_1(insurance_package_info));
		template.appendChild(await step_2(insurance_package_info));
		template.appendChild(await tourist_list_dom());
		template.appendChild(await page_footer());
		await render_tourist(tourist_list);
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
	template.appendChild(await step_2(insurance_package_info));
	template.appendChild(await tourist_list_dom());
	template.appendChild(await page_footer(data));
	await render_tourist(tourist_list);
	
	return template;
}