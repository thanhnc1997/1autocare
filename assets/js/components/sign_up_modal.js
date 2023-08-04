import {
	create_element,
	render_icon,
	fetch_data,
	api_end_point,
	number_only,
	bhdt_api,
	toast,
	loader,
	remove_loader,
	input_required_check
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

let modal_settings = {
	id: 'confirm_modal',
	overlay_close: true,
	modal_template: {
		body: {
			html: `
			<h3 class="mb-14">Bạn đã tạo tài khoản <span class="text-success cursor-pointer">thành công</span></h3>
			<p class="text-secondary">
				Cảm ơn vì đã lựa chọn chúng tôi trở thành đối tác của bạn. Hãy liên hệ với nhà quản trị theo số điện thoại <a class="text-primary" href="tel:19002266">1900 22 66</a> để được kích hoạt tài khoản.
			</p>
			`
		},
		footer: {
			html: `
			<div class="text-right">
				<button type="button" id="other" class="btn btn-light mr-8">Đóng</button>
				<button type="button" id="ok" class="btn btn-cyan">Đã hiểu</button>
			</div>
			`
		}
	},
	async okay(params) {
		document.body.classList.remove('overflow-hidden');
	},
	async other(params) {
		document.body.classList.remove('overflow-hidden');
	}
}

export const render = async () => {
	let modal = create_element('div');
	modal.classList.add('modal');
	
	async function remove_modal(dom_trigger) {
		dom_trigger.addEventListener('click', () => {
			modal.remove();
			document.body.classList.remove('overflow-hidden');
		});
	}
	
	async function handle_sign_up(params) {
		modal.remove();
		await remove_loader();
		let popup = await import('./modal.js');
		document.body.appendChild(await popup.default(modal_settings));
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
		<h4 class="modal-title">Đăng ký</h4>
		<p>Bạn đã có tài khoản? <span class="text-primary cursor-pointer">Đăng nhập</span></p>
		<button type="button" class="btn">${render_icon.times(icon_settings.times)}</button>
		`;
		
		remove_modal(div.querySelector('.btn'));
		div.querySelector('span').addEventListener('click', async () => {
			let block = await import('./sign_in_modal.js');
			document.body.appendChild(await block.render());
			await modal.remove();
		});
		
		return div;
	}
	
	async function modal_body() {
		let div = create_element('div');
		div.classList.add('modal-body');
		div.innerHTML = `
		<!--
		<nav class="nav-tab" style="margin: -16px -16px 18px;">
			<span class="nav-item active">Đại lý</span>
			<span class="nav-item">Cá nhân</span>
		</nav>
		-->

		<div class="grid grid-2 gap-14 mb-14">
			<div>
				<label class="label">SĐT</label>
				<input class="input" type="text" placeholder="SĐT" name="phone_number">
			</div>
			<div>
				<label class="label">Email</label>
				<input class="input" type="text" placeholder="Email" name="email">
			</div>
		</div>

		<div class="d-flex" style="align-items: flex-end;">
			<div class="row" style="flex-grow: 1;">
				<div class="col-6">
					<label class="label">Mật khẩu</label>
					<input class="input" type="password" placeholder="Mật khẩu" name="password">
				</div>

				<div class="col-6">
					<label class="label">Nhập lại mật khẩu</label>
					<input class="input" type="password" placeholder="Nhập lại" name="re_password">
				</div>
			</div>
			<button class="btn">
				${render_icon.show(icon_settings.show)}
			</button>
		</div>
		`;
		
		div.querySelector('.btn').addEventListener('click', (e) => {
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
		
		return div;
	}
	
	async function modal_footer() {
		let sign_up_request = {
			url: bhdt_api + api_end_point.register,
			method: 'POST',
			auth: '',
			body: {},
			show_message: true,
			async callback(params) {
				await remove_loader();
				await handle_sign_up(params);
			}
		}
		
		let div = create_element('div');
		div.classList.add('modal-footer', 'text-right');
		div.innerHTML = `
		<button type="button" class="btn btn-secondary mr-8">Hủy</button>
		<button type="button" class="btn btn-primary">Đăng ký</button>
		`;
		
		remove_modal(div.querySelector('.btn.btn-secondary'));
		
		div.querySelector('.btn-primary').addEventListener('click', async () => {
			let phone_number = modal.querySelector('input[name="phone_number"]').value,
					email = modal.querySelector('input[name="email"]').value,
					password = modal.querySelector('input[name="password"]').value,
					re_password = modal.querySelector('input[name="re_password"]').value;
			
			if (password !== re_password) {
				toast({
					message: `${render_icon.circle_warning(icon_settings.circle_warning)} Mật khẩu nhập lại không đúng`,
					type: 'warning'
				});
				return;
			}
			
			let val = await input_required_check({
				dom: modal
			});
			
			if (val == false) return false;
			sign_up_request.body = {
				phone: phone_number,
				email: email,
				password: password,
				rePassword: re_password,
			}
			// await loader();
			await fetch_data(sign_up_request);
		});
		
		return div;
	}
	
	modal.querySelector('.modal-content').appendChild(await modal_header());
	modal.querySelector('.modal-content').appendChild(await modal_body());
	modal.querySelector('.modal-content').appendChild(await modal_footer());
	await remove_modal(modal.querySelector('.overlay'));
	
	return modal;
}