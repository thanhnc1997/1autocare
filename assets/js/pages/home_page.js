import {
	create_element,
	render_icon,
	fetch_data,
	bhdt_api,
	api_end_point,
	remove_loader,
	remove_local_storage,
	side_btn_group,
	convert_timestamp
} from '../helper.js';

let icon_settings = {
	chevron_left: {
		width: 6,
		height: 10,
		fill: '#333',
		stroke_width: 1.5
	},
	chevron_right: {
		width: 6,
		height: 10,
		fill: '#333',
		stroke_width: 1.5
	},
}

export const render = async () => {
	let div = create_element('div');
	div.classList.add('home-page');
	
	async function hero_section() {
		let section = create_element('section');
		section.classList.add('hero');
		
		section.innerHTML = `
		<div class="container">
			<div class="image"></div>
			<div class="wrapper">
				<div class="content left">
					<h1><span>Chuẩn mực </span>từ sự lựa chọn.</h1>
					<p>
						Chúng tôi đem lại giải pháp công nghệ giúp cho người dùng có thể lựa chọn các sản phẩm đa dạng với thông tin chính xác minh bạch. Tận dụng tối đa các dịch vụ bảo hiểm mà chúng tôi lựa chọn và cung cấp.
					</p>
					<div class="btn-group d-flex mb-14">
						<a href="tel:19002266" class="btn btn-yellow mr-12">Nhận tư vấn ngay</a>
						<button type="button" class="btn btn-light">Trở thành đại lý</button>
					</div>
				</div>
			</div>
		</div>
		`;
		
		section.querySelector('.btn-light').addEventListener('click', async () => {
			let block = await import('../components/sign_up_modal.js');
			document.body.appendChild(await block.render());
			document.body.classList.add('overflow-hidden');
		});
		
		return section;
	}
	
	async function about_section() {
		let div = create_element('section');
		div.classList.add('about');
		div.innerHTML = `
		<div class="container">
			<div>
				<span><img src="/assets/images/car.svg"></span>
				<p>Bảo hiểm thiệt hại vật chất đối với xe được bảo hiểm</p>
			</div>
			<div>
				<span><img src="/assets/images/shield.svg"></span>
				<p>Bảo hiểm trách nhiệm bên thứ ba</p>
			</div>
			<div>
				<span><img src="/assets/images/team.svg"></span>
				<p>Bảo hiểm cho lái xe và hành khách</p>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function product_section() {
		let div = create_element('section');
		div.classList.add('products');
		div.setAttribute('id', 'products');
		div.innerHTML = `
		<div class="container">
			<h2>Các sản phẩm chúng tôi cung cấp</h2>
			<div class="grid">
				
				
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function call_to_action() {
		let div = create_element('section');
		div.classList.add('call-to-action');
		div.innerHTML = `
		<div class="grid align-items-center">
			<h3>Chúng tôi thiết kế gói bảo hiểm phù hợp nhu cầu bản thân<br> <b>dành riêng cho bạn.</b></h3>
			<div class="button-group">
				<a href="tel:0866787939" class="btn btn-yellow mr-14">Nhận tư vấn ngay</a>
				<a href="#products" class="btn btn-light">Xem chi tiết</a>
			</div>
		</div>
		`;
		
		return div;
	}
	
	async function fetch_products(params, dom) {
		if (!params || !dom) return false;
		let {datas} = params;
		datas.map(product => {
			let {typeInsurance, namePackageProvider, imagePreview} = product;
			
			let item = create_element('div');
			item.classList.add('item');
			item.innerHTML = `
			<div class="image" style="background-image: url(${bhdt_api.replace('/api', '')}${imagePreview})">
				<a href="/product/id=${typeInsurance}"></a>
			</div>
			<h3>
				<a href="/product/id=${typeInsurance}">${namePackageProvider}</a>${render_icon.chevron_right(icon_settings.chevron_right)}
			</h3>
			`;
			
			dom.appendChild(item);
		});
	}
	
	let product_request = {
		url: bhdt_api + api_end_point.products + '?partner=1autocare',
		method: 'GET',
		async callback(params) {
			await fetch_products(params, div.querySelector('#products .grid'));
		}
	}
	
	div.appendChild(await hero_section());
	div.appendChild(await about_section());
	div.appendChild(await product_section());
	div.appendChild(await call_to_action());
	
	await fetch_data(product_request);
	// await side_btn_group();
	
	return div;
}

export const callback = async () => {
	await remove_loader();
}