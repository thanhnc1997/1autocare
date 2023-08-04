import {
	create_element,
	bhdt_api,
	api_end_point,
	fetch_data,
	render_icon,
	input_required_check,
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
	},
	plus: {
		width: 12,
		height: 12,
		fill: '#3B71CA',
		stroke_width: 1.5
	},
	times: {
		width: 12,
		height: 12,
		fill: '#000',
		stroke_width: 1.5
	},
	show: {
		width: 18,
		height: 12,
		fill: '#999',
		stroke_width: 1.5
	},
	hide: {
		width: 18,
		height: 12,
		fill: '#999',
		stroke_width: 1.5
	},
	edit: {
		width: 18,
		height: 18,
		fill: '#000',
		stroke_width: 1.5
	}
}

let skip = 1,
		limit = 10,
		total_page = 0

export const render = async (params) => {
	let {user_local_storage} = params;
	
	let template = create_element('div');
	template.classList.add('dashboard');
	let container = create_element('div');
	container.classList.add('container');
	
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
	
	let get_agent_list = {
		url: bhdt_api + api_end_point.sale_agent + '/list' + `?crPage=${skip}&maxRow=${limit}`,
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {
			status: 127
		},
		async callback(params) {
			await remove_loader();
			await render_agent_list(params);
			await get_total_page(params);
		}
	}
	
	let create_agent = {
		url: bhdt_api + api_end_point.sale_agent + '/register',
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {},
		show_message: true,
		async callback(params) {
			await remove_loader();
			await fetch_data(get_agent_list)
		}
	}
	
	let update_agent = {
		url: bhdt_api + api_end_point.sale_agent + '/update',
		method: 'POST',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {},
		show_message: true,
		async callback(params) {
			await remove_loader();
			await fetch_data(get_agent_list)
		}
	}
	
	async function get_total_page(params) {
		let {totalRow} = params;
		total_page = Math.ceil(totalRow / limit);
		
		template.querySelector('.page').innerHTML = `Trang ${skip} / ${total_page}`;
	}
	
	async function create_modal() {
		let modal = create_element('div');
		modal.classList.add('modal');
		modal.innerHTML = `
		<div class="overlay"></div>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title">Tạo mới Sale Agent</h4>
					<button type="button" class="btn">${render_icon.times(icon_settings.times)}</button>
				</div>
				<div class="modal-body">
					<div class="mb-14">
						<label class="label required">Họ & tên</label>
						<input class="input" type="text" placeholder="Họ & tên" name="full_name" required>
					</div>
					<div class="grid grid-2 gap-14 mb-14">
						<div>
							<label class="label required">SĐT</label>
							<input class="input phone-check" type="tel" placeholder="SĐT" name="phone_number" required>
						</div>
						<div>
							<label class="label">Email</label>
							<input class="input" type="text" placeholder="Email" name="email">
						</div>
					</div>
					<div class="d-flex" style="align-items: flex-end;">
						<div class="row" style="flex-grow: 1;">
							<div class="col-6">
								<label class="label required">Mật khẩu</label>
								<input class="input" type="password" placeholder="Mật khẩu" name="password" required>
							</div>

							<div class="col-6">
								<label class="label required">Nhập lại mật khẩu</label>
								<input class="input" type="password" placeholder="Nhập lại" name="re_password" required>
							</div>
						</div>
						<button class="btn">
							${render_icon.show(icon_settings.show)}
						</button>
					</div>
				</div>
				<div class="modal-footer text-right">
					<button class="btn btn-secondary">Hủy</button>
					<button class="btn btn-primary">Lưu</button>
				</div>
			</div>
		</div>
		`;
		
		let ok_btn = modal.querySelector('.modal-footer .btn-primary'),
				cancel_btn = modal.querySelector('.modal-footer .btn-secondary'),
				toggle_pass_btn = modal.querySelector('.modal-body .btn'),
				full_name = modal.querySelector('input[name="full_name"]'),
				phone_number = modal.querySelector('input[name="phone_number"]'),
				email = modal.querySelector('input[name="email"]'),
				password = modal.querySelector('input[name="password"]'),
				re_password = modal.querySelector('input[name="re_password"]')
		
		toggle_pass_btn.addEventListener('click', (e) => {
			e.currentTarget.parentElement.querySelectorAll('input').forEach(input_password => {
				if (input_password.getAttribute('type') == 'password') {
					input_password.setAttribute('type', 'text');
					e.currentTarget.innerHTML = render_icon.hide(icon_settings.hide);
					return;
				}

				if (input_password.getAttribute('type') == 'text') {
					input_password.setAttribute('type', 'password');
					e.currentTarget.innerHTML = render_icon.show(icon_settings.show);
					return;
				}
			});
		});
		
		ok_btn.addEventListener('click', async () => {
			let val = input_required_check({
				dom: modal
			});
			if (val == false) return false;
			
			create_agent.body = {
				fullName: full_name.value,
				phone: phone_number.value,
				email: email.value,
				password: password.value,
				rePassword: re_password.value
			}
			await loader();
			await fetch_data(create_agent);
			await remove_modal(ok_btn);
		});
		
		async function remove_modal(dom) {
			dom.addEventListener('click', () => {
				modal.remove();
				document.body.classList.remove('overflow-hidden');
			});
		}
		await remove_modal(modal.querySelector('.overlay'));
		await remove_modal(modal.querySelector('.modal-header button'));
		await remove_modal(cancel_btn);
		
		return modal;
	}
	
	async function update_modal(params) {
		let {fullName, email, phone, id} = params;
		
		let modal = create_element('div');
		modal.classList.add('modal');
		modal.innerHTML = `
		<div class="overlay"></div>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title">Cập nhật thông tin Sale Agent</h4>
					<button type="button" class="btn">${render_icon.times(icon_settings.times)}</button>
				</div>
				<div class="modal-body">
					<div class="mb-14">
						<label class="label required">Họ & tên</label>
						<input class="input" type="text" placeholder="Họ & tên" name="full_name" value="${fullName}" required>
					</div>
					<div class="grid grid-2 gap-14 mb-14">
						<div>
							<label class="label required">SĐT</label>
							<input class="input phone-check" type="tel" placeholder="SĐT" name="phone_number" value="${phone}" required>
						</div>
						<div>
							<label class="label">Email</label>
							<input class="input" type="text" placeholder="Email" name="email" value="${email}">
						</div>
					</div>
				</div>
				<div class="modal-footer text-right">
					<button class="btn btn-secondary">Hủy</button>
					<button class="btn btn-primary">Cập nhật</button>
				</div>
			</div>
		</div>
		`;
		
		let ok_btn = modal.querySelector('.modal-footer .btn-primary'),
				cancel_btn = modal.querySelector('.modal-footer .btn-secondary'),
				full_name = modal.querySelector('input[name="full_name"]'),
				phone_number = modal.querySelector('input[name="phone_number"]'),
				_email = modal.querySelector('input[name="email"]')
		
		ok_btn.addEventListener('click', async () => {
			let val = input_required_check({
				dom: modal
			});
			
			if (val == false) return false;
			
			await update_info({
				email: _email.value,
				phone_number: phone_number.value,
				full_name: full_name.value,
				id: id
			})
		});
		
		async function remove_modal(dom) {
			dom.addEventListener('click', () => {
				modal.remove();
				document.body.classList.remove('overflow-hidden');
			});
		}
		await remove_modal(modal.querySelector('.overlay'));
		await remove_modal(modal.querySelector('.modal-header button'));
		await remove_modal(cancel_btn);
		await remove_modal(ok_btn);
		
		return modal;
	}
	
	async function sale_list() {
		let div = create_element('div');
		div.innerHTML = `
		<h3 class="section-title small">Danh sách	sale</h3>
		
		<div class="card" style="margin-bottom: 14px;">
			<button class="btn btn-cyan" id="add_sale_agent">
				${render_icon.plus(icon_settings.plus)} Thêm mới
			</button>
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
							<th width="20%">Trạng thái</th>
							<th width="5%"></th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		</div>
		`;
		
		div.querySelector('#add_sale_agent').addEventListener('click', async () => {
			document.body.classList.add('overflow-hidden');
			document.body.appendChild(await create_modal());
		});
		
		let table = div.querySelector('table'),
				prev = div.querySelector('.table-pagination .prev'),
				next = div.querySelector('.table-pagination .next'),
				select = div.querySelector('.table-pagination [name="records"]');
		
		prev.addEventListener('click', async () => {
			load_record_per_page('des');
		});
		
		next.addEventListener('click', async () => {
			load_record_per_page('ins');
		});
		
		select.addEventListener('change', async (e) => {
			limit = e.target.value;
			get_agent_list.url = bhdt_api + api_end_point.sale_agent + '/list' + `?crPage=1&maxRow=${limit}`;
			await load_record_per_page();
		});
		
		return div;
	}
	
	async function load_record_per_page(type) {
		if (type == 'ins') skip += 1;
		if (type == 'des') skip -= 1;
		if (!type) skip = 1;
		
		if (skip > total_page) {
			skip = total_page;
			template.querySelector('.table-pagination .page').innerHTML = `Trang ${skip} / ${total_page}`;
			return;
		}
		
		if (skip < 1) {
			skip = 1;
			template.querySelector('.table-pagination .page').innerHTML = `Trang ${skip} / ${total_page}`;
			return;
		}
		
		get_agent_list.url = bhdt_api + api_end_point.sale_agent + '/list' + `?crPage=${skip}&maxRow=${limit}`,
		await loader();
		await fetch_data(get_agent_list);
	}
	
	async function update_status(params) {
		let {id, status} = params;
		let new_status = '';
		if (status == 1) new_status = 0;
		if (status == 0) new_status = 1;
		update_agent.url = bhdt_api + api_end_point.sale_agent + '/update/' + id;
		update_agent.body = {
			status: new_status
		}
		
		await fetch_data(update_agent);
	}
	
	async function update_info(params) {
		let {id, phone_number, email, full_name} = params;
		update_agent.url = bhdt_api + api_end_point.sale_agent + '/update/' + id;
		update_agent.body = {
			fullName: full_name,
			phone: phone_number,
			email: email
		}
		await loader();
		await fetch_data(update_agent);
	}
	
	async function render_agent_list(params) {
		template.querySelector('tbody').innerHTML = '';
		let {datas} = params;
		datas.map(async (item, index) => {
			let {phone, username, status, email, fullName} = item;
			let tr = create_element('tr');
			tr.innerHTML = `
			<td class="text-center">${index + 1}</td>
			<td>${fullName}</td>
			<td>${phone}</td>
			<td>${email || ''}</td>
			<td>
				<div class="d-flex align-items-center">
					<label class="switch mr-6">
						<input type="checkbox" ${status == 1 ? 'checked' : ''}>
						<span class="slider"></span>
					</label>
					${status == 1 ? '<span class="text-success">Đang HĐ</span>' : '<span class="text-secondary">Ngừng HĐ</span>'}
				</div>
			</td>
			<td>
				<button class="btn btn-secondary edit">${render_icon.edit(icon_settings.edit)}</button>
			</td>
			`;
			
			tr.querySelector('input[type="checkbox"]').addEventListener('change', async () => {
				await loader();
				await update_status(item);
			});
			
			tr.querySelector('.edit').addEventListener('click', async () => {
				document.body.classList.add('overflow-hidden');
				document.body.appendChild(await update_modal(item));
			});
			
			template.querySelector('tbody').appendChild(tr);
		});
	}
	
	await fetch_data(get_info_request);
	await fetch_data(get_agent_list);
	
	return template;
}