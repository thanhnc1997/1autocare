import {
	create_element,
	api_end_point,
	bhdt_api,
	fetch_data,
	input_required_check,
	toast,
	loader,
	remove_loader,
	render_icon
} from '../../../helper.js';

import dashboard_nav from '../../../components/dashboard_nav.js';

let icon_settings = {
	circle_warning: {
		width: 14,
		height: 14,
		fill: '#856404',
		stroke_width: 1.5
	},
	circle_success: {
		width: 14,
		height: 14,
		fill: '#155724',
		stroke_width: 1.5
	},
	show: {
		width: 18,
		height: 12,
		fill: '#000',
		stroke_width: 1.5
	},
	hide: {
		width: 18,
		height: 12,
		fill: '#000',
		stroke_width: 1.5
	},
}

export const render = async (params) => {
	let {user_local_storage} = params;
	
	let template = create_element('div');
	template.classList.add('dashboard');
	let container = create_element('div');
	container.classList.add('container');
	
	async function personal_infomation(params) {
		let {fullName, phone, email, code} = params.data;
		let div = create_element('div');
		div.innerHTML = `
		<h3 class="section-title small">Thông tin cá nhân</h3>
		<div class="card">
			<div class="row">
				<div class="col-md-6 mb-14">
					<span class="label">Họ & tên</span>
					<input class="input" type="text" placeholder="Họ & tên" name="user_name" value="${fullName}" readonly>
				</div>
				<div class="col-md-6 mb-14">
					<span class="label">SĐT</span>
					<input class="input" type="text" placeholder="SĐT" name="user_phone" value="${phone}" readonly>
				</div>
				<div class="col-md-6 mb-14">
					<span class="label">Email</span>
					<input class="input" type="text" placeholder="Email" name="user_email" value="${email}" readonly>
				</div>
				<div class="col-md-6 mb-14">
					<span class="label">Mã giới thiệu</span>
					<input class="input" type="text" placeholder="Mã giới thiệu" name="user_code" value="" readonly>
				</div>
			</div>
			<p class="text-right"><button type="button" class="btn btn-primary">Cập nhật</button></p>
		</div>
		`;
		
		return div;
	}
	
	let change_pass_request = {
		method: 'POST',
		url: bhdt_api + api_end_point.profile + '/change-password',
		auth: user_local_storage['user'],
		api_key: user_local_storage['api_key'],
		body: {},
		async callback() {
			await remove_loader();
		}
	}
	
	async function change_password(params) {
		let div = create_element('div');
		div.innerHTML = `
		<h3 class="section-title small">Đổi mật khẩu</h3>
		<div class="card" style="padding-bottom: 2px;">
			<div class="row">
				<div class="col-md-3 mb-14">
					<span class="label requried">Nhập mật khẩu cũ</span>
					<input class="input" type="password" placeholder="Mật khẩu cũ" name="old_user_password">
				</div>
				<div class="col-md-3 mb-14">
					<span class="label requried">Nhập mật khẩu mới</span>
					<input class="input" type="password" placeholder="Mật khẩu mới" name="user_password">
				</div>
				<div class="col-md-3 mb-14">
					<span class="label requried">Nhập lại mật khẩu mới</span>
					<input class="input" type="password" placeholder="Nhập lại mật khẩu mới" name="re_user_password">
				</div>
				<div class="col-md-3 d-flex mb-14" style="align-items: flex-end; justify-content: flex-end;">
					<button style="margin-top: 14px;" type="button" class="btn btn-light mr-6">
						${render_icon.show(icon_settings.show)}
					</button>
					<button style="margin-top: 14px;" type="button" class="btn btn-primary">Cập nhật</button>
				</div>
			</div>
		</div>
		`;
		
		let update_btn = div.querySelector('.btn-primary'),
				old_pass = div.querySelector('[name="old_user_password"]'),
				new_pass = div.querySelector('[name="user_password"]'),
				re_pass = div.querySelector('[name="re_user_password"]'),
				show_pass_btn = div.querySelector('.btn-light')
				
		update_btn.addEventListener('click', async () => {
			let val = await input_required_check({
				dom: div
			});
			
			if (val == false) return false;
			
			if (re_pass.value != new_pass.value) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Mật khẩu nhập lại không đúng`,
					type: 'warning'
				});
				return false;
			}
			
			change_pass_request.body = {
				oldPassword: old_pass.value,
				password: new_pass.value,
				rePassword: re_pass.value
			}
			
			await loader();
			await fetch_data(change_pass_request);
		});
		
		show_pass_btn.addEventListener('click', (e) => {
			if (
				old_pass.getAttribute('type') == 'text' &&
				new_pass.getAttribute('type') == 'text' &&
				re_pass.getAttribute('type') == 'text'
			) {
				old_pass.setAttribute('type', 'password');
				new_pass.setAttribute('type', 'password');
				re_pass.setAttribute('type', 'password');
				e.currentTarget.innerHTML = render_icon.show(icon_settings.show);
				
				return;
			}
			
			if (
				old_pass.getAttribute('type') == 'password' &&
				new_pass.getAttribute('type') == 'password' &&
				re_pass.getAttribute('type') == 'password'
			) {
				old_pass.setAttribute('type', 'text');
				new_pass.setAttribute('type', 'text');
				re_pass.setAttribute('type', 'text');
				e.currentTarget.innerHTML = render_icon.hide(icon_settings.hide);
				
				return;
			}
		});
		
		return div;
	}
	
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
			container.appendChild(await personal_infomation(params));
			container.appendChild(await change_password(params));
			template.appendChild(container);
		}
	}
	
	fetch_data(get_info_request)
	
	return template;
}