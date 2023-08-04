import {
	create_element,
	remove_loader,
	remove_local_storage,
	bhdt_api,
	convert_timestamp
} from '../helper.js';

import breadcrumbs from '../components/breadcrumbs.js';

let urls = [
	{
		text: 'Trang chủ',
		url: '/'
	},
	{
		text: 'Tin tức',
		url: '/articles'
	}
];

export const render = async (params) => {
	let {data} = params;
	let div = create_element('div');
	div.classList.add('page', 'article-detail-page');
	
	async function page_content(params) {
		let {title, createdAt, imagePreview, content} = params;
		let div = create_element('section');
		div.innerHTML = `
		<div class="container">
			<article class="content">
				<h3 class="section-title">${title}</h3>
				<time>${await convert_timestamp(createdAt)}</time>
				<div class="image" style="background-image: url(${bhdt_api.replace('/api', '')}${imagePreview})"></div>
				<div class="paragraph">
					${content}
				</div>
			</article>
		</div>
		`;
		
		return div;
	}
	
	async function call_to_action() {
		let div = create_element('div');
		div.classList.add('call-to-action');
		div.innerHTML = `
		<div class="grid align-items-center">
			<h3>Thiết kế gói bảo hiểm riêng <b>phù hợp nhu cầu bản thân.</b></h3>
			<div class="button-group">
				<a href="tel:19002266" class="btn btn-cyan mr-14">Nhận tư vấn ngay</a>
				<a href="#products" class="btn btn-outline-cyan">Xem chi tiết</a>
			</div>
		</div>
		`;
		
		return div;
	}
	
	div.appendChild(await breadcrumbs(urls));
	div.appendChild(await page_content(data));
	div.appendChild(await call_to_action());
	
	return div;
}

export const callback = async () => {
	await remove_loader();
}