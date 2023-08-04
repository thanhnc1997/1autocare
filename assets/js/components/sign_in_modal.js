import {
	create_element,
	render_icon,
	fetch_data,
	api_end_point,
	bhdt_api,
	set_local_storage,
	remove_local_storage,
	toast
} from '../helper.js';

let icon_settings = {
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
	circle_warning: {
		width: 14,
		height: 14,
		fill: '#856404',
		stroke_width: 1.5
	}
}

export const render = async () => {
	let modal = create_element('div');
	modal.classList.add('modal');
	modal.setAttribute('id', 'sign_in_modal');
	
	async function remove_modal(dom_trigger) {
		if (!dom_trigger) return false;
		dom_trigger.addEventListener('click', () => {
			modal.remove();
			document.body.classList.remove('overflow-hidden');
		});
	}
	
	async function handle_sign_in(params) {
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
				await location.reload()
			}
		});
	}
	
	modal.innerHTML = `
	<div class="overlay"></div>
	<div class="modal-dialog">
		<div class="modal-content">
			
		</div>
	</div>
	`;
	remove_modal(modal.querySelector('.overlay'));
	
	async function modal_header() {
		let div = create_element('div');
		div.classList.add('modal-header');
		div.innerHTML = `
		<h4 class="modal-title">Đăng nhập</h4>
		<p>Bạn chưa có tài khoản? <span class="text-primary cursor-pointer">Đăng ký</span></p>
		<button type="button" class="btn">${render_icon.times(icon_settings.times)}</button>
		`;
		
		remove_modal(div.querySelector('.btn'));
		
		div.querySelector('span').addEventListener('click', async () => {
			let block = await import('./sign_up_modal.js');
			document.body.appendChild(await block.render());
			await modal.remove();
		});
		
		return div;
	}
	
	async function modal_body() {
		let div = create_element('div');
		div.classList.add('modal-body');
		div.innerHTML = `
		<label class="label">SĐT (hoặc tên đăng nhập)</label>
		<input class="input mb-14" type="text" placeholder="SĐT/Tên đăng nhập" name="user_name">

		<label class="label">Mật khẩu</label>
		<div class="input align-items-center mb-14" style="display: flex;">
			<input style="flex-grow: 1; border: 0;" type="password" placeholder="Mật khẩu" name="password">
			<button style="margin-right: -12px;" class="btn btn-seondary">
				${render_icon.show(icon_settings.show)}
			</button>
		</div>
		`;
		
		div.querySelector('.btn').addEventListener('click', (e) => {
			let input_password = div.querySelector('input[name="password"]');
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
		
		return div;
	}
	
	async function modal_footer() {
		let div = create_element('div');
		div.classList.add('modal-footer', 'text-right');
		div.innerHTML = `
		<button type="button" class="btn btn-secondary mr-8">Hủy</button>
		<button type="button" class="btn btn-primary">Đăng nhập</button>
		`;
		
		remove_modal(div.querySelector('.btn.btn-secondary'));
		
		let login_request = {
			url: bhdt_api + api_end_point.login,
			method: 'POST',
			auth: '',
			body: {},
			show_message: true,
			async callback(params) {
				await handle_sign_in(params);
			}
		}
		div.querySelector('.btn.btn-primary').addEventListener('click', function() {
			let username = modal.querySelector('input[name="user_name"]').value,
					password = modal.querySelector('input[name="password"]').value;
			
			if (!username) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Tên đăng nhập không được để trống`,
					type: 'warning'
				});
				return;
			}
			
			if (!password) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Mật khẩu không được để trống`,
					type: 'warning'
				});
				return;
			}
			
			login_request.body = {
				username: username,
				password: password
			}
			
			fetch_data(login_request);
		});
		
		return div;
	}
	
	modal.querySelector('.modal-content').appendChild(await modal_header());
	modal.querySelector('.modal-content').appendChild(await modal_body());
	modal.querySelector('.modal-content').appendChild(await modal_footer());
	
	return modal;
}

export const callback = () => {
	let modal = document.querySelector('#sign_in_modal');
	modal.querySelector('input[name="user_name"]').focus();
	
	window.addEventListener('keyup', (e) => {
		if (e.keyCode == 13) {
			modal.querySelector('.modal-footer .btn.btn-primary').click();
		}
	});
}