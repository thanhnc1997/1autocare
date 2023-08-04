import {
	create_element,
	get_local_storage,
	remove_local_storage,
	lazy_load,
	bhdt_api,
	api_end_point,
	fetch_data,
	toast,
	render_icon,
	check_expried_token
} from './helper.js';

let pathname = location.pathname,
		main = document.querySelector('main');

check_expried_token(await get_local_storage({name: 'guest'}));
check_expried_token(await get_local_storage({name: 'user'}));

async function append_header_and_footer() {
	let header = await import('./components/page_header.js');
	let footer = await import('./components/page_footer.js');
	document.body.insertBefore(await header.default(), document.body.querySelector('main'));
	document.body.insertBefore(await footer.default(), document.body.querySelector('script'));
}

if (!location.pathname.includes('/dashboard')) append_header_and_footer();

async function init_app() {
	let app = create_element('div');
	app.setAttribute('id', 'main');

	const render = {
		async home() {
			let script_tag = create_element('script');
			script_tag.setAttribute('src', './assets/libs/glide/glide.js');
			document.body.insertBefore(script_tag, document.body.querySelector('script'));
			main.appendChild(await lazy_load.home());
			let block = await import('./pages/home_page.js');
			app.appendChild(await block.render());
			main.appendChild(app);
			await block.callback();
		},
		async articles() {
			main.appendChild(await lazy_load.articles_page());
			let block = await import('./pages/articles_page.js');
			app.appendChild(await block.render());
			main.appendChild(app);
			await block.callback();
		},
		async article_detail(params) {
			let block = await import('./pages/article_detail.js');
			app.appendChild(await block.render(params));
			main.appendChild(app);
			await block.callback();
		},
		async product_detail(params) {
			let block = await import('./pages/product_detail.js');
			if (!localStorage.getItem('user') && !localStorage.getItem('guest')) {
				await block.error_page(params);
			}
			await block.callback();
			app.appendChild(await block.render(params));
			main.appendChild(app);
		},
		async dashboard(params) {
			let block = await import('./pages/dashboard/dashboard.js');
			if (localStorage.getItem('user')) {
				app.appendChild(await block.render(params));
			}
			else {
				app.appendChild(await block.error_page(params));
			}
			main.appendChild(app);
		},
		async payment(params) {
			let block = await import('./pages/payment_page.js');
			if (!localStorage.getItem('user') && !localStorage.getItem('guest')) {
				await block.error_page(params);
			}
			app.appendChild(await block.render(params));
			main.appendChild(app);
		}
	}
	//
	// dashboard
	//
	if (location.pathname.includes('/dashboard')) render.dashboard();
	//
	// home page
	//
	if (pathname == '/') render.home();
	//
	// article
	//
	if (pathname == '/articles') render.articles();

	if (pathname.includes('/articles/id')) {
		main.appendChild(await lazy_load.article_detail());
		let end_point = pathname.split('/')[2].replace('id=', '');
		let article_detail_request = {
			url: bhdt_api + api_end_point.articles + '/' + end_point,
			method: 'GET',
			async callback(params) {
				await render.article_detail(params)
			}
		}
		fetch_data(article_detail_request);
	}
	//
	// product
	//
	if (pathname.includes('/product/id')) {
		main.appendChild(await lazy_load.product());
		let end_point = pathname.split('/')[2].replace('id=', '');
		let product_detail_request = {
			url: bhdt_api + api_end_point.products + '/' + end_point,
			method: 'GET',
			async callback(params) {
				await render.product_detail(params);
			}
		}
		fetch_data(product_detail_request);
	}
	//
	// payment
	//
	if (!pathname.includes('/payment')) remove_local_storage({name: 'payment'});
	if (pathname.includes('/payment')) {
		let end_point = '';
		if (pathname.includes('/payment/payment-callback')) {
			end_point = location.search;
		}
		
		render.payment({
			end_point: end_point
		})
	}
}

init_app();