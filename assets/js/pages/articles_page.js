import {
	create_element,
	fetch_data,
	api_end_point,
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

export const render = async () => {
	let div = create_element('div');
	div.classList.add('page', 'articles-page');
	
	async function list() {
		let div = create_element('section');
		div.innerHTML = `
		<div class="container">
			<h3 class="section-title mb-24">Tin tức</h3>
			<div class="grid"></div>
		</div>
		`;
		
		return div;
	}
	
	async function fetch_articles(params, dom) {
		if (!params || !dom) return false;
		let {datas} = params;
		datas.map(async article => {
			let {id, title, imagePreview, createdAt} = article;
			
			let item = create_element('article');
			item.classList.add('article');
			item.innerHTML = `
			<div class="image" style="background-image: url(${bhdt_api.replace('/api', '') + imagePreview})"><a href="/articles/id=${id}"></a></div>
			<div class="content">
				<h3>
					<a href="/articles/id=${id}">${title}</a>
				</h3>
				<time>${await convert_timestamp(createdAt)}</time>
			</div>
			`;
			dom.appendChild(item);
		});
	}
	
	let article_request = {
		url: bhdt_api + api_end_point.articles + '/list',
		method: 'POST',
		body: {
			pageRequest: {
				page: 1,
				maxRow: 20
			},
			post: {
				categoryId: 0,
				title: '',
				status: 1
			}
		},
		async callback(params) {
			await fetch_articles(params, div.querySelector('section .grid'));
		}
	}
	
	div.appendChild(await breadcrumbs(urls));
	div.appendChild(await list());
	//
	// generate data
	//
	await fetch_data(article_request);
	
	return div;
}

export const callback = async () => {
	await remove_loader();
}