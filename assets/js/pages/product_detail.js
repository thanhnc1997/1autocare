import {
	create_element,
	remove_loader,
	remove_local_storage,
	login_as_guest
} from '../helper.js';

import breadcrumbs from '../components/breadcrumbs.js';
import modal from '../components/modal.js';

let urls = [
	{
		text: 'Trang chủ',
		url: '/'
	},
	{
		text: 'Sản phẩm',
		url: '/'
	}
];

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
				<button type="button" id="other" class="btn btn-outline-yellow mr-8">Mua ẩn danh</button>
				<button type="button" id="ok" class="btn btn-yellow">Đăng nhập</button>
			</div>
			`
		}
	},
	async okay(params) {
		let sign_in_modal = await import('../components/sign_in_modal.js');
		document.body.appendChild(await sign_in_modal.render());
		document.body.classList.add('overflow-hidden');
		await sign_in_modal.callback();
	},
	async other(params) {
		document.body.classList.remove('overflow-hidden');
		await login_as_guest();
	}
}

export const render = async (params) => {
	let {data} = params;
	let {typeInsurance, namePackageProvider, description} = data;
	let div = create_element('div');
	div.classList.add('page', 'product-detail-page');
	
	let container = create_element('div');
	container.classList.add('container');
	container.innerHTML = `
	<div class="section-heading">
		<h3 class="section-title">${namePackageProvider}</h3>
	</div>
	`
	
	async function page_content() {
		let div = create_element('section');
		
		return div;
	}
	
	async function load_form_by_product_id(id) {
		if (id == 'bao-hiem-xe-may-mic' || id == 'bao-hiem-xe-may-pvi') {
			let block = await import('./bhxm/bhxm.js')
			container.appendChild(await block.render(data));
		}
		
		if (id == 'bao-hiem-xe-oto-pvi' || id == 'bao-hiem-tnds-xe-oto-mic') {
			let block = await import('./bhoto/bhoto.js')
			container.appendChild(await block.render(data));
		}
		
		if (id == 'bao-hiem-du-lich-toan-cau-mic') {
			let block = await import('./bhdlqt/bhdlqt.js')
			container.appendChild(await block.render(data));
		}
		
		if (id == 'bao-hiem-du-lich-trong-nuoc-mic') {
			let block = await import('./bhdltn/bhdltn.js')
			container.appendChild(await block.render(data));
		}
		
		if (id == 'bao-hiem-vat-chat-xe-oto-pvi') {
			let block = await import('./bhvcoto/bhvcoto.js')
			container.appendChild(await block.render(data));
		}
	}
	
	div.appendChild(await breadcrumbs(urls));
	div.appendChild(await page_content(params));
	await load_form_by_product_id(typeInsurance);
	div.querySelector('section').appendChild(await container);
	
	return div;
}

export const callback = async () => {
	await remove_loader();
}

export const error_page = async () => {
	document.body.appendChild(await modal(modal_settings));
}